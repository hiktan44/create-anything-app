import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");
    const trendType = searchParams.get("trend_type");
    const timeframe = searchParams.get("timeframe");

    if (!companyId) {
      return Response.json(
        { error: "Company ID is required" },
        { status: 400 },
      );
    }

    let whereClause = "WHERE company_id = $1";
    let values = [companyId];
    let paramCount = 1;

    if (trendType) {
      paramCount++;
      whereClause += ` AND trend_type = $${paramCount}`;
      values.push(trendType);
    }

    if (timeframe) {
      paramCount++;
      whereClause += ` AND timeframe = $${paramCount}`;
      values.push(timeframe);
    }

    const trends = await sql(
      `SELECT * FROM trend_detections ${whereClause} ORDER BY created_at DESC`,
      values,
    );

    return Response.json({ trends });
  } catch (error) {
    console.error("Error fetching trend detections:", error);
    return Response.json({ error: "Failed to fetch trends" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { company_id, analysis_scope, timeframe, focus_areas } = body;

    if (!company_id) {
      return Response.json(
        {
          error: "Company ID is required",
        },
        { status: 400 },
      );
    }

    // Get relevant trade data for trend analysis
    const tradeData = await sql(
      "SELECT * FROM trade_data ORDER BY year DESC, country LIMIT 500",
    );

    // Generate AI-powered trend detection
    const trendResult = await generateTrendDetection({
      analysis_scope: analysis_scope || "global",
      timeframe: timeframe || "12_months",
      focus_areas: focus_areas || [
        "market_growth",
        "emerging_products",
        "trade_patterns",
      ],
      trade_data: tradeData,
    });

    // Save trends to database
    const savedTrends = [];
    for (const trend of trendResult.trends) {
      const [savedTrend] = await sql(
        `INSERT INTO trend_detections (
          company_id, trend_type, timeframe, market_scope,
          trend_strength, growth_rate, confidence_score,
          trend_description, key_indicators, impact_assessment,
          opportunities, recommendations, data_sources, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          company_id,
          trend.trend_type,
          timeframe || "12_months",
          analysis_scope || "global",
          trend.trend_strength,
          trend.growth_rate,
          trend.confidence_score,
          trend.description,
          trend.key_indicators,
          trend.impact_assessment,
          trend.opportunities,
          trend.recommendations,
          "AI Trend Analysis, Trade Statistics, Market Intelligence",
        ],
      );
      savedTrends.push(savedTrend);
    }

    return Response.json({
      trends: savedTrends,
      analysis_summary: trendResult.summary,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating trend detection:", error);
    return Response.json(
      { error: "Failed to create trend analysis" },
      { status: 500 },
    );
  }
}

async function generateTrendDetection({
  analysis_scope,
  timeframe,
  focus_areas,
  trade_data,
}) {
  try {
    const systemPrompt = `You are an expert trend analyst specializing in international trade patterns, emerging markets, and global commerce trends. Identify and analyze significant market trends with data-driven insights.`;

    const userPrompt = `
Analyze emerging trends in international trade:

ANALYSIS PARAMETERS:
- Scope: ${analysis_scope}
- Timeframe: ${timeframe}
- Focus Areas: ${focus_areas.join(", ")}

TRADE DATA SAMPLE:
${trade_data
  .slice(0, 20)
  .map(
    (t) =>
      `${t.country} - ${t.product_category}: $${t.import_value}M imports, $${t.export_value}M exports, ${t.growth_rate}% growth (${t.year})`,
  )
  .join("\n")}

Identify and analyze significant trends:

1. EMERGING MARKET TRENDS:
   - Growing markets and sectors
   - Declining markets to avoid
   - Seasonal patterns and cycles
   - Geographic shifts in trade

2. PRODUCT & CATEGORY TRENDS:
   - Rising product categories
   - Innovation-driven changes
   - Consumer preference shifts
   - Technology impact on trade

3. TRADE PATTERN ANALYSIS:
   - New trade corridors
   - Policy-driven changes
   - Supply chain evolution
   - Economic factor impacts

4. OPPORTUNITY IDENTIFICATION:
   - Untapped markets
   - Early-mover advantages
   - Partnership opportunities
   - Investment timing insights

Provide actionable insights with trend strength ratings and confidence scores.
    `;

    const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        json_schema: {
          name: "trend_detection",
          schema: {
            type: "object",
            properties: {
              trends: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    trend_type: { type: "string" },
                    description: { type: "string" },
                    trend_strength: { type: "number" },
                    growth_rate: { type: "number" },
                    confidence_score: { type: "number" },
                    key_indicators: {
                      type: "array",
                      items: { type: "string" },
                    },
                    impact_assessment: { type: "string" },
                    opportunities: {
                      type: "array",
                      items: { type: "string" },
                    },
                    recommendations: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: [
                    "trend_type",
                    "description",
                    "trend_strength",
                    "growth_rate",
                    "confidence_score",
                    "key_indicators",
                    "impact_assessment",
                    "opportunities",
                    "recommendations",
                  ],
                  additionalProperties: false,
                },
              },
              summary: {
                type: "object",
                properties: {
                  total_trends_identified: { type: "number" },
                  strongest_trend: { type: "string" },
                  highest_opportunity: { type: "string" },
                  key_insights: {
                    type: "array",
                    items: { type: "string" },
                  },
                  strategic_priorities: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: [
                  "total_trends_identified",
                  "strongest_trend",
                  "highest_opportunity",
                  "key_insights",
                  "strategic_priorities",
                ],
                additionalProperties: false,
              },
            },
            required: ["trends", "summary"],
            additionalProperties: false,
          },
        },
      }),
    });

    const aiResult = await response.json();
    const analysis = JSON.parse(aiResult.choices[0].message.content);

    return analysis;
  } catch (error) {
    console.error("Error generating trend detection:", error);
    throw error;
  }
}
