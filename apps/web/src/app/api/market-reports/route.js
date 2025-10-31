import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    if (!companyId) {
      return Response.json({ error: "Company ID required" }, { status: 400 });
    }

    const reports = await sql`
      SELECT * FROM market_reports 
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
    `;

    return Response.json({ reports });
  } catch (error) {
    console.error("Error fetching market reports:", error);
    return Response.json(
      { error: "Failed to fetch market reports" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      company_id,
      report_title,
      report_type,
      country,
      product_category,
      total_imports,
      total_exports,
      average_unit_price,
      trend_direction,
      key_competitors,
      recommendations,
    } = body;

    const result = await sql`
      INSERT INTO market_reports (
        company_id, report_title, report_type, country, product_category,
        total_imports, total_exports, average_unit_price, trend_direction,
        key_competitors, recommendations
      ) VALUES (
        ${company_id}, ${report_title}, ${report_type}, ${country}, ${product_category},
        ${total_imports}, ${total_exports}, ${average_unit_price}, ${trend_direction},
        ${key_competitors}, ${recommendations}
      ) RETURNING *
    `;

    return Response.json({ report: result[0] });
  } catch (error) {
    console.error("Error creating market report:", error);
    return Response.json(
      { error: "Failed to create market report" },
      { status: 500 },
    );
  }
}
