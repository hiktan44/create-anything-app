import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    if (!companyId) {
      return Response.json({ error: "Company ID required" }, { status: 400 });
    }

    const markets = await sql`
      SELECT * FROM target_markets 
      WHERE product_id IN (
        SELECT id FROM products WHERE company_id = ${companyId}
      )
      ORDER BY created_at DESC
    `;

    return Response.json({ markets });
  } catch (error) {
    console.error("Error fetching target markets:", error);
    return Response.json(
      { error: "Failed to fetch target markets" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      product_id,
      country,
      market_potential,
      import_volume,
      average_price,
      growth_rate,
      competition_level,
    } = body;

    const result = await sql`
      INSERT INTO target_markets (
        product_id, country, market_potential, import_volume, 
        average_price, growth_rate, competition_level
      ) VALUES (
        ${product_id}, ${country}, ${market_potential}, ${import_volume},
        ${average_price}, ${growth_rate}, ${competition_level}
      ) RETURNING *
    `;

    return Response.json({ market: result[0] });
  } catch (error) {
    console.error("Error creating target market:", error);
    return Response.json(
      { error: "Failed to create target market" },
      { status: 500 },
    );
  }
}
