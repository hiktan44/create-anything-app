import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");
    const productId = searchParams.get("product_id");
    const targetMarket = searchParams.get("target_market");

    if (!companyId) {
      return Response.json(
        { error: "Company ID is required" },
        { status: 400 },
      );
    }

    let whereClause = "WHERE company_id = $1";
    let values = [companyId];
    let paramCount = 1;

    if (productId) {
      paramCount++;
      whereClause += ` AND product_id = $${paramCount}`;
      values.push(productId);
    }

    if (targetMarket) {
      paramCount++;
      whereClause += ` AND target_market = $${paramCount}`;
      values.push(targetMarket);
    }

    const optimizations = await sql(
      `SELECT po.*, p.product_name, p.hs_code, p.category, p.unit_price as current_price
       FROM price_optimizations po 
       JOIN products p ON po.product_id = p.id 
       ${whereClause} 
       ORDER BY po.created_at DESC`,
      values,
    );

    return Response.json({ optimizations });
  } catch (error) {
    console.error("Error fetching price optimizations:", error);
    return Response.json(
      { error: "Failed to fetch optimizations" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      company_id,
      product_id,
      target_market,
      competitor_data,
      market_conditions,
    } = body;

    if (!company_id || !product_id) {
      return Response.json(
        {
          error: "Company ID and Product ID are required",
        },
        { status: 400 },
      );
    }

    // Get product details
    const [product] = await sql(
      "SELECT * FROM products WHERE id = $1 AND company_id = $2",
      [product_id, company_id],
    );

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    // Get trade data for price context
    const tradeData = await sql(
      "SELECT * FROM trade_data WHERE hs_code = $1 AND country = $2 ORDER BY year DESC LIMIT 10",
      [product.hs_code, target_market || "Global"],
    );

    // Generate AI-powered price optimization
    const optimizationResult = await generatePriceOptimization({
      product,
      target_market: target_market || "Global",
      competitor_data: competitor_data || {},
      market_conditions: market_conditions || {},
      trade_data: tradeData,
    });

    // Save optimization to database
    const [optimization] = await sql(
      `INSERT INTO price_optimizations (
        company_id, product_id, target_market, current_price, 
        optimal_price, price_range_min, price_range_max,
        profit_margin, competitiveness_score, market_positioning,
        pricing_strategy, key_factors, risks, recommendations,
        confidence_score, data_sources, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP)
      ON CONFLICT (company_id, product_id, target_market)
      DO UPDATE SET
        current_price = EXCLUDED.current_price,
        optimal_price = EXCLUDED.optimal_price,
        price_range_min = EXCLUDED.price_range_min,
        price_range_max = EXCLUDED.price_range_max,
        profit_margin = EXCLUDED.profit_margin,
        competitiveness_score = EXCLUDED.competitiveness_score,
        market_positioning = EXCLUDED.market_positioning,
        pricing_strategy = EXCLUDED.pricing_strategy,
        key_factors = EXCLUDED.key_factors,
        risks = EXCLUDED.risks,
        recommendations = EXCLUDED.recommendations,
        confidence_score = EXCLUDED.confidence_score,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        company_id,
        product_id,
        target_market || "Global",
        product.unit_price,
        optimizationResult.optimal_price,
        optimizationResult.price_range.min,
        optimizationResult.price_range.max,
        optimizationResult.profit_margin,
        optimizationResult.competitiveness_score,
        optimizationResult.market_positioning,
        optimizationResult.pricing_strategy,
        optimizationResult.key_factors,
        optimizationResult.risks,
        optimizationResult.recommendations,
        optimizationResult.confidence_score,
        "AI Price Analysis, Market Data, Competitor Intelligence",
      ],
    );

    return Response.json({
      optimization,
      analysis_summary: optimizationResult.summary,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating price optimization:", error);
    return Response.json(
      { error: "Failed to create optimization" },
      { status: 500 },
    );
  }
}

async function generatePriceOptimization({
  product,
  target_market,
  competitor_data,
  market_conditions,
  trade_data,
}) {
  try {
    const systemPrompt = `You are an expert pricing strategist specializing in international trade and market optimization. Analyze market conditions and provide optimal pricing recommendations with detailed strategic insights.`;

    const userPrompt = `
Analyze optimal pricing strategy for this product:

PRODUCT DETAILS:
- Name: ${product.product_name}
- Category: ${product.category}
- HS Code: ${product.hs_code}
- Current Price: ${product.unit_price} ${product.currency || "USD"}
- Material: ${product.material || "Not specified"}
- Technical Specs: ${product.technical_specs || "Standard specifications"}

TARGET MARKET: ${target_market}

MARKET DATA CONTEXT:
${trade_data
  .slice(0, 5)
  .map(
    (t) =>
      `Year ${t.year}: Import Value $${t.import_value}M, Volume ${t.import_volume}K units, Growth ${t.growth_rate}%`,
  )
  .join("\n")}

COMPETITOR DATA: ${JSON.stringify(competitor_data)}
MARKET CONDITIONS: ${JSON.stringify(market_conditions)}

Provide comprehensive pricing optimization analysis:

1. OPTIMAL PRICING STRATEGY:
   - Recommended optimal price point
   - Pricing range (min-max)
   - Profit margin analysis
   - Market positioning strategy

2. COMPETITIVE ANALYSIS:
   - Competitiveness score vs market
   - Price sensitivity analysis
   - Value proposition assessment

3. STRATEGIC RECOMMENDATIONS:
   - Key pricing factors
   - Risk assessment
   - Implementation recommendations
   - Market entry pricing tactics

4. CONFIDENCE METRICS:
   - Analysis confidence level
   - Data quality assessment

Focus on actionable pricing strategies that maximize both competitiveness and profitability.
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
          name: "price_optimization",
          schema: {
            type: "object",
            properties: {
              optimal_price: { type: "number" },
              price_range: {
                type: "object",
                properties: {
                  min: { type: "number" },
                  max: { type: "number" },
                },
                required: ["min", "max"],
                additionalProperties: false,
              },
              profit_margin: { type: "number" },
              competitiveness_score: { type: "number" },
              market_positioning: { type: "string" },
              pricing_strategy: { type: "string" },
              key_factors: {
                type: "array",
                items: { type: "string" },
              },
              risks: {
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
                  price_change_percentage: { type: "number" },
                  expected_impact: { type: "string" },
                  implementation_priority: { type: "string" },
                  market_response_prediction: { type: "string" },
                  key_insights: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: [
                  "price_change_percentage",
                  "expected_impact",
                  "implementation_priority",
                  "market_response_prediction",
                  "key_insights",
                ],
                additionalProperties: false,
              },
            },
            required: [
              "optimal_price",
              "price_range",
              "profit_margin",
              "competitiveness_score",
              "market_positioning",
              "pricing_strategy",
              "key_factors",
              "risks",
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
    console.error("Error generating price optimization:", error);
    throw error;
  }
}
