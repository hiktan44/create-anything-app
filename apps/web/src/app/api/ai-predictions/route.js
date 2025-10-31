import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");
    const predictionType = searchParams.get("type");
    const period = searchParams.get("period");

    if (!companyId) {
      return Response.json(
        { error: "Company ID is required" },
        { status: 400 },
      );
    }

    let whereClause = "WHERE company_id = $1";
    let values = [companyId];
    let paramCount = 1;

    if (predictionType) {
      paramCount++;
      whereClause += ` AND prediction_type = $${paramCount}`;
      values.push(predictionType);
    }

    if (period) {
      paramCount++;
      whereClause += ` AND period = $${paramCount}`;
      values.push(period);
    }

    const predictions = await sql(
      `SELECT * FROM ai_predictions ${whereClause} ORDER BY created_at DESC`,
      values,
    );

    return Response.json({ predictions });
  } catch (error) {
    console.error("Error fetching AI predictions:", error);
    return Response.json(
      { error: "Failed to fetch predictions" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      company_id,
      prediction_type,
      target_market,
      product_category,
      hs_code,
      period,
      market_data,
    } = body;

    if (!company_id || !prediction_type || !period) {
      return Response.json(
        {
          error: "Company ID, prediction type, and period are required",
        },
        { status: 400 },
      );
    }

    // Generate AI prediction based on type
    let predictionResult;

    switch (prediction_type) {
      case "market_forecast":
        predictionResult = await generateMarketForecast({
          target_market,
          product_category,
          hs_code,
          period,
          market_data,
        });
        break;
      case "price_trend":
        predictionResult = await generatePriceTrend({
          target_market,
          product_category,
          hs_code,
          period,
          market_data,
        });
        break;
      case "demand_prediction":
        predictionResult = await generateDemandPrediction({
          target_market,
          product_category,
          hs_code,
          period,
          market_data,
        });
        break;
      default:
        return Response.json(
          { error: "Invalid prediction type" },
          { status: 400 },
        );
    }

    // Save prediction to database
    const [prediction] = await sql(
      `INSERT INTO ai_predictions (
        company_id, prediction_type, target_market, product_category, 
        hs_code, period, confidence_score, prediction_data, 
        key_insights, recommendations, data_sources
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *`,
      [
        company_id,
        prediction_type,
        target_market,
        product_category,
        hs_code,
        period,
        predictionResult.confidence_score,
        JSON.stringify(predictionResult.prediction_data),
        predictionResult.key_insights,
        predictionResult.recommendations,
        predictionResult.data_sources,
      ],
    );

    return Response.json({ prediction, status: "success" });
  } catch (error) {
    console.error("Error creating AI prediction:", error);
    return Response.json(
      { error: "Failed to create prediction" },
      { status: 500 },
    );
  }
}

async function generateMarketForecast({
  target_market,
  product_category,
  hs_code,
  period,
  market_data,
}) {
  try {
    const systemPrompt = `You are an expert trade analyst specializing in global market forecasting. Analyze the provided data and generate accurate market predictions.`;

    const userPrompt = `
Generate a comprehensive market forecast for:
- Target Market: ${target_market || "Global"}
- Product Category: ${product_category || "General"}
- HS Code: ${hs_code || "Not specified"}
- Forecast Period: ${period}
- Current Market Data: ${JSON.stringify(market_data || {})}

Please provide:
1. Market size predictions (growth percentage, value estimates)
2. Key growth drivers and risks
3. Competitive landscape changes
4. Consumer demand trends
5. Economic factors impact
6. Seasonal variations
7. Confidence level (0-100%)

Format your response as structured analysis with specific numerical predictions where possible.
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
          name: "market_forecast",
          schema: {
            type: "object",
            properties: {
              market_size_change: { type: "number" },
              growth_percentage: { type: "number" },
              estimated_value: { type: "number" },
              confidence_score: { type: "number" },
              growth_drivers: {
                type: "array",
                items: { type: "string" },
              },
              risks: {
                type: "array",
                items: { type: "string" },
              },
              seasonal_trends: {
                type: "object",
                properties: {
                  high_season: { type: "string" },
                  low_season: { type: "string" },
                  seasonal_variance: { type: "number" },
                },
                required: ["high_season", "low_season", "seasonal_variance"],
                additionalProperties: false,
              },
              key_insights: {
                type: "array",
                items: { type: "string" },
              },
              recommendations: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: [
              "market_size_change",
              "growth_percentage",
              "estimated_value",
              "confidence_score",
              "growth_drivers",
              "risks",
              "seasonal_trends",
              "key_insights",
              "recommendations",
            ],
            additionalProperties: false,
          },
        },
      }),
    });

    const aiResult = await response.json();
    const prediction = JSON.parse(aiResult.choices[0].message.content);

    return {
      confidence_score: prediction.confidence_score / 100,
      prediction_data: {
        market_size_change: prediction.market_size_change,
        growth_percentage: prediction.growth_percentage,
        estimated_value: prediction.estimated_value,
        seasonal_trends: prediction.seasonal_trends,
      },
      key_insights: prediction.key_insights,
      recommendations: prediction.recommendations,
      data_sources: "AI Analysis, Trade Statistics, Market Intelligence",
    };
  } catch (error) {
    console.error("Error generating market forecast:", error);
    throw error;
  }
}

async function generatePriceTrend({
  target_market,
  product_category,
  hs_code,
  period,
  market_data,
}) {
  try {
    const systemPrompt = `You are a pricing analyst expert in global trade. Analyze market conditions and predict price trends with high accuracy.`;

    const userPrompt = `
Analyze price trends for:
- Target Market: ${target_market || "Global"}
- Product Category: ${product_category || "General"}
- HS Code: ${hs_code || "Not specified"}
- Analysis Period: ${period}
- Market Data: ${JSON.stringify(market_data || {})}

Provide detailed price analysis including:
1. Price direction (increase/decrease/stable)
2. Expected percentage change
3. Price volatility assessment
4. Cost factor analysis (raw materials, shipping, regulations)
5. Competitive pricing impact
6. Currency exchange effects
7. Confidence level
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
          name: "price_trend",
          schema: {
            type: "object",
            properties: {
              price_direction: { type: "string" },
              percentage_change: { type: "number" },
              volatility_level: { type: "string" },
              confidence_score: { type: "number" },
              cost_factors: {
                type: "array",
                items: { type: "string" },
              },
              price_drivers: {
                type: "array",
                items: { type: "string" },
              },
              key_insights: {
                type: "array",
                items: { type: "string" },
              },
              recommendations: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: [
              "price_direction",
              "percentage_change",
              "volatility_level",
              "confidence_score",
              "cost_factors",
              "price_drivers",
              "key_insights",
              "recommendations",
            ],
            additionalProperties: false,
          },
        },
      }),
    });

    const aiResult = await response.json();
    const prediction = JSON.parse(aiResult.choices[0].message.content);

    return {
      confidence_score: prediction.confidence_score / 100,
      prediction_data: {
        price_direction: prediction.price_direction,
        percentage_change: prediction.percentage_change,
        volatility_level: prediction.volatility_level,
        cost_factors: prediction.cost_factors,
      },
      key_insights: prediction.key_insights,
      recommendations: prediction.recommendations,
      data_sources: "AI Price Analysis, Market Data, Economic Indicators",
    };
  } catch (error) {
    console.error("Error generating price trend:", error);
    throw error;
  }
}

async function generateDemandPrediction({
  target_market,
  product_category,
  hs_code,
  period,
  market_data,
}) {
  try {
    const systemPrompt = `You are a demand forecasting specialist with expertise in international trade patterns and consumer behavior analysis.`;

    const userPrompt = `
Predict demand patterns for:
- Target Market: ${target_market || "Global"}
- Product Category: ${product_category || "General"}
- HS Code: ${hs_code || "Not specified"}
- Forecast Period: ${period}
- Available Data: ${JSON.stringify(market_data || {})}

Analyze:
1. Demand growth/decline predictions
2. Consumer behavior shifts
3. Market saturation levels
4. Import/export volume forecasts
5. Seasonal demand patterns
6. Economic impact on demand
7. Competitive substitution risks
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
          name: "demand_prediction",
          schema: {
            type: "object",
            properties: {
              demand_direction: { type: "string" },
              volume_change_percentage: { type: "number" },
              market_saturation: { type: "string" },
              confidence_score: { type: "number" },
              demand_drivers: {
                type: "array",
                items: { type: "string" },
              },
              consumer_trends: {
                type: "array",
                items: { type: "string" },
              },
              seasonal_patterns: {
                type: "object",
                properties: {
                  peak_months: {
                    type: "array",
                    items: { type: "string" },
                  },
                  low_months: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["peak_months", "low_months"],
                additionalProperties: false,
              },
              key_insights: {
                type: "array",
                items: { type: "string" },
              },
              recommendations: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: [
              "demand_direction",
              "volume_change_percentage",
              "market_saturation",
              "confidence_score",
              "demand_drivers",
              "consumer_trends",
              "seasonal_patterns",
              "key_insights",
              "recommendations",
            ],
            additionalProperties: false,
          },
        },
      }),
    });

    const aiResult = await response.json();
    const prediction = JSON.parse(aiResult.choices[0].message.content);

    return {
      confidence_score: prediction.confidence_score / 100,
      prediction_data: {
        demand_direction: prediction.demand_direction,
        volume_change_percentage: prediction.volume_change_percentage,
        market_saturation: prediction.market_saturation,
        seasonal_patterns: prediction.seasonal_patterns,
      },
      key_insights: prediction.key_insights,
      recommendations: prediction.recommendations,
      data_sources: "AI Demand Analysis, Consumer Data, Trade Statistics",
    };
  } catch (error) {
    console.error("Error generating demand prediction:", error);
    throw error;
  }
}
