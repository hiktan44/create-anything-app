import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");
    const productId = searchParams.get("product_id");
    const minScore = searchParams.get("min_score") || 0.5;

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

    paramCount++;
    whereClause += ` AND match_score >= $${paramCount}`;
    values.push(minScore);

    const matches = await sql(
      `SELECT pm.*, p.product_name, p.hs_code, p.category 
       FROM product_matches pm 
       JOIN products p ON pm.product_id = p.id 
       ${whereClause} 
       ORDER BY pm.match_score DESC, pm.created_at DESC`,
      values,
    );

    return Response.json({ matches });
  } catch (error) {
    console.error("Error fetching product matches:", error);
    return Response.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { company_id, product_id, target_markets } = body;

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

    // Get existing trade data for context
    const tradeData = await sql(
      "SELECT * FROM trade_data WHERE hs_code = $1 ORDER BY year DESC LIMIT 50",
      [product.hs_code],
    );

    // Generate AI-powered product-market matches
    const matchResults = await generateProductMatches({
      product,
      target_markets: target_markets || [],
      trade_data: tradeData,
    });

    // Save matches to database
    const savedMatches = [];
    for (const match of matchResults.matches) {
      const [savedMatch] = await sql(
        `INSERT INTO product_matches (
          company_id, product_id, target_market, match_score, 
          market_size, competition_level, entry_barriers, 
          growth_potential, cultural_fit, regulatory_complexity,
          key_advantages, risk_factors, recommendations,
          data_sources, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)
        ON CONFLICT (company_id, product_id, target_market) 
        DO UPDATE SET 
          match_score = EXCLUDED.match_score,
          market_size = EXCLUDED.market_size,
          competition_level = EXCLUDED.competition_level,
          entry_barriers = EXCLUDED.entry_barriers,
          growth_potential = EXCLUDED.growth_potential,
          cultural_fit = EXCLUDED.cultural_fit,
          regulatory_complexity = EXCLUDED.regulatory_complexity,
          key_advantages = EXCLUDED.key_advantages,
          risk_factors = EXCLUDED.risk_factors,
          recommendations = EXCLUDED.recommendations,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *`,
        [
          company_id,
          product_id,
          match.target_market,
          match.match_score,
          match.market_size,
          match.competition_level,
          match.entry_barriers,
          match.growth_potential,
          match.cultural_fit,
          match.regulatory_complexity,
          match.key_advantages,
          match.risk_factors,
          match.recommendations,
          "AI Analysis, Trade Statistics, Market Intelligence",
        ],
      );
      savedMatches.push(savedMatch);
    }

    return Response.json({
      matches: savedMatches,
      analysis_summary: matchResults.summary,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating product matches:", error);
    return Response.json(
      { error: "Failed to create matches" },
      { status: 500 },
    );
  }
}

async function generateProductMatches({ product, target_markets, trade_data }) {
  try {
    const systemPrompt = `You are an expert international trade analyst specializing in product-market matching. Analyze products and identify the best target markets with detailed scoring and insights.`;

    const userPrompt = `
Analyze this product for optimal market matching:

PRODUCT DETAILS:
- Name: ${product.product_name}
- Category: ${product.category}
- HS Code: ${product.hs_code}
- Material: ${product.material || "Not specified"}
- Unit Price: ${product.unit_price} ${product.currency || "USD"}
- Technical Specs: ${product.technical_specs || "Standard specifications"}

TRADE DATA CONTEXT:
${trade_data
  .slice(0, 10)
  .map(
    (t) =>
      `${t.country}: Import Value $${t.import_value}M, Growth ${t.growth_rate}%`,
  )
  .join("\n")}

TARGET MARKETS TO EVALUATE: ${target_markets.length > 0 ? target_markets.join(", ") : "All major markets (US, Germany, UK, France, Italy, Japan, China, Canada, Australia, Netherlands)"}

Provide comprehensive market matching analysis with:

1. MATCH SCORING (0.0-1.0 scale):
   - Overall compatibility score
   - Market size assessment  
   - Competition intensity
   - Entry barrier difficulty
   - Growth potential rating
   - Cultural fit score
   - Regulatory complexity

2. DETAILED ANALYSIS:
   - Key competitive advantages
   - Main risk factors
   - Strategic recommendations
   - Market entry suggestions

Focus on data-driven insights and practical business recommendations.
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
          name: "product_market_matching",
          schema: {
            type: "object",
            properties: {
              matches: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    target_market: { type: "string" },
                    match_score: { type: "number" },
                    market_size: { type: "string" },
                    competition_level: { type: "string" },
                    entry_barriers: { type: "string" },
                    growth_potential: { type: "string" },
                    cultural_fit: { type: "number" },
                    regulatory_complexity: { type: "string" },
                    key_advantages: {
                      type: "array",
                      items: { type: "string" },
                    },
                    risk_factors: {
                      type: "array",
                      items: { type: "string" },
                    },
                    recommendations: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: [
                    "target_market",
                    "match_score",
                    "market_size",
                    "competition_level",
                    "entry_barriers",
                    "growth_potential",
                    "cultural_fit",
                    "regulatory_complexity",
                    "key_advantages",
                    "risk_factors",
                    "recommendations",
                  ],
                  additionalProperties: false,
                },
              },
              summary: {
                type: "object",
                properties: {
                  total_markets_analyzed: { type: "number" },
                  best_match_market: { type: "string" },
                  average_match_score: { type: "number" },
                  key_insights: {
                    type: "array",
                    items: { type: "string" },
                  },
                  strategic_recommendations: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: [
                  "total_markets_analyzed",
                  "best_match_market",
                  "average_match_score",
                  "key_insights",
                  "strategic_recommendations",
                ],
                additionalProperties: false,
              },
            },
            required: ["matches", "summary"],
            additionalProperties: false,
          },
        },
      }),
    });

    const aiResult = await response.json();
    const analysis = JSON.parse(aiResult.choices[0].message.content);

    return analysis;
  } catch (error) {
    console.error("Error generating product matches:", error);
    throw error;
  }
}
