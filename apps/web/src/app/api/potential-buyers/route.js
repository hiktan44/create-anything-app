import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    if (!companyId) {
      return Response.json({ error: "Company ID required" }, { status: 400 });
    }

    const buyers = await sql`
      SELECT * FROM potential_buyers 
      WHERE company_id = ${companyId}
      ORDER BY match_score DESC, created_at DESC
    `;

    return Response.json({ buyers });
  } catch (error) {
    console.error("Error fetching potential buyers:", error);
    return Response.json(
      { error: "Failed to fetch potential buyers" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      company_id,
      buyer_name,
      buyer_country,
      industry_segment,
      company_size,
      import_frequency,
      last_import_date,
      match_score,
      contact_email,
      contact_phone,
      website,
      notes,
    } = body;

    const result = await sql`
      INSERT INTO potential_buyers (
        company_id, buyer_name, buyer_country, industry_segment, company_size,
        import_frequency, last_import_date, match_score, contact_email, 
        contact_phone, website, notes
      ) VALUES (
        ${company_id}, ${buyer_name}, ${buyer_country}, ${industry_segment}, ${company_size},
        ${last_import_date}, ${last_import_date}, ${match_score}, ${contact_email},
        ${contact_phone}, ${website}, ${notes}
      ) RETURNING *
    `;

    return Response.json({ buyer: result[0] });
  } catch (error) {
    console.error("Error creating potential buyer:", error);
    return Response.json(
      { error: "Failed to create potential buyer" },
      { status: 500 },
    );
  }
}
