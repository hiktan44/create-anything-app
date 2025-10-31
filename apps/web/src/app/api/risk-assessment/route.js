import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");
    const targetMarket = searchParams.get("target_market");
    const riskType = searchParams.get("risk_type");

    if (!companyId) {
      return Response.json(
        { error: "Company ID is required" },
        { status: 400 },
      );
    }

    let whereClause = "WHERE company_id = $1";
    let values = [companyId];
    let paramCount = 1;

    if (targetMarket) {
      paramCount++;
      whereClause += ` AND target_market = $${paramCount}`;
      values.push(targetMarket);
    }

    if (riskType) {
      paramCount++;
      whereClause += ` AND risk_type = $${paramCount}`;
      values.push(riskType);
    }

    const assessments = await sql(
      `SELECT * FROM risk_assessments ${whereClause} ORDER BY created_at DESC`,
      values,
    );

    return Response.json({ assessments });
  } catch (error) {
    console.error("Error fetching risk assessments:", error);
    return Response.json(
      { error: "Failed to fetch assessments" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { company_id, target_market, product_category, assessment_type } =
      body;

    if (!company_id || !target_market) {
      return Response.json(
        {
          error: "Company ID and target market are required",
        },
        { status: 400 },
      );
    }

    // Generate AI-powered risk assessment
    const riskResult = await generateRiskAssessment({
      target_market,
      product_category: product_category || "General",
      assessment_type: assessment_type || "comprehensive",
    });

    // Save assessment to database
    const [assessment] = await sql(
      `INSERT INTO risk_assessments (
        company_id, target_market, product_category, risk_type,
        overall_risk_score, political_risk, economic_risk, regulatory_risk,
        currency_risk, market_risk, operational_risk,
        risk_factors, mitigation_strategies, recommendations,
        confidence_score, data_sources, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP)
      ON CONFLICT (company_id, target_market, product_category)
      DO UPDATE SET
        overall_risk_score = EXCLUDED.overall_risk_score,
        political_risk = EXCLUDED.political_risk,
        economic_risk = EXCLUDED.economic_risk,
        regulatory_risk = EXCLUDED.regulatory_risk,
        currency_risk = EXCLUDED.currency_risk,
        market_risk = EXCLUDED.market_risk,
        operational_risk = EXCLUDED.operational_risk,
        risk_factors = EXCLUDED.risk_factors,
        mitigation_strategies = EXCLUDED.mitigation_strategies,
        recommendations = EXCLUDED.recommendations,
        confidence_score = EXCLUDED.confidence_score,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        company_id,
        target_market,
        product_category || "General",
        assessment_type || "comprehensive",
        riskResult.overall_risk_score,
        riskResult.risk_categories.political,
        riskResult.risk_categories.economic,
        riskResult.risk_categories.regulatory,
        riskResult.risk_categories.currency,
        riskResult.risk_categories.market,
        riskResult.risk_categories.operational,
        riskResult.risk_factors,
        riskResult.mitigation_strategies,
        riskResult.recommendations,
        riskResult.confidence_score,
        "AI Risk Analysis, Economic Indicators, Political Data",
      ],
    );

    return Response.json({
      assessment,
      analysis_summary: riskResult.summary,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating risk assessment:", error);
    return Response.json(
      { error: "Failed to create assessment" },
      { status: 500 },
    );
  }
}

async function generateRiskAssessment({
  target_market,
  product_category,
  assessment_type,
}) {
  try {
    const systemPrompt = `You are an expert international trade risk analyst with deep knowledge of global markets, political stability, economic indicators, and regulatory environments.`;

    const userPrompt = `
Conduct comprehensive risk assessment for international trade:

TARGET MARKET: ${target_market}
PRODUCT CATEGORY: ${product_category}
ASSESSMENT TYPE: ${assessment_type}

Analyze all major risk categories and provide detailed assessment:

1. POLITICAL RISK ANALYSIS:
   - Government stability
   - Trade policy changes
   - Regulatory environment
   - International relations

2. ECONOMIC RISK FACTORS:
   - Currency volatility
   - Inflation rates
   - GDP growth stability
   - Economic policy changes

3. MARKET & OPERATIONAL RISKS:
   - Market competition
   - Consumer behavior shifts
   - Supply chain disruptions
   - Infrastructure challenges

4. REGULATORY & COMPLIANCE:
   - Import/export regulations
   - Product standards
   - Certification requirements
   - Tax implications

Provide actionable insights with risk scores (0.0-1.0) and mitigation strategies.
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
          name: "risk_assessment",
          schema: {
            type: "object",
            properties: {
              overall_risk_score: { type: "number" },
              risk_categories: {
                type: "object",
                properties: {
                  political: { type: "number" },
                  economic: { type: "number" },
                  regulatory: { type: "number" },
                  currency: { type: "number" },
                  market: { type: "number" },
                  operational: { type: "number" },
                },
                required: [
                  "political",
                  "economic",
                  "regulatory",
                  "currency",
                  "market",
                  "operational",
                ],
                additionalProperties: false,
              },
              risk_factors: {
                type: "array",
                items: { type: "string" },
              },
              mitigation_strategies: {
                type: "array",
                items: { type: "string" },
              },
              recommendations: {
                type: "array",
                items: { type: "string" },
              },
              confidence_score: { type: "number" },
              summary: {
                type: "object",
                properties: {
                  risk_level: { type: "string" },
                  primary_concerns: {
                    type: "array",
                    items: { type: "string" },
                  },
                  market_entry_advice: { type: "string" },
                  monitoring_priorities: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: [
                  "risk_level",
                  "primary_concerns",
                  "market_entry_advice",
                  "monitoring_priorities",
                ],
                additionalProperties: false,
              },
            },
            required: [
              "overall_risk_score",
              "risk_categories",
              "risk_factors",
              "mitigation_strategies",
              "recommendations",
              "confidence_score",
              "summary",
            ],
            additionalProperties: false,
          },
        },
      }),
    });

    const aiResult = await response.json();
    const analysis = JSON.parse(aiResult.choices[0].message.content);

    return analysis;
  } catch (error) {
    console.error("Error generating risk assessment:", error);
    throw error;
  }
}
