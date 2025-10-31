import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    // If company_id provided, filter by it, otherwise return all campaigns
    let campaigns;
    if (companyId) {
      campaigns = await sql`
        SELECT * FROM campaigns 
        WHERE company_id = ${companyId}
        ORDER BY created_at DESC
      `;
    } else {
      campaigns = await sql`
        SELECT * FROM campaigns 
        ORDER BY created_at DESC
      `;
    }

    return Response.json({ campaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return Response.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      company_id,
      campaign_name,
      target_country,
      email_template,
      status,
      total_recipients,
      emails_sent,
      open_rate,
      response_rate,
      conversion_rate,
    } = body;

    console.log("=== CAMPAIGN CREATION DEBUG ===");
    console.log("Request body:", body);
    console.log("company_id:", company_id);

    // Validate required fields
    if (!campaign_name) {
      return Response.json(
        { error: "Campaign name is required" },
        { status: 400 },
      );
    }

    // Check current constraints before inserting
    try {
      const constraints = await sql`
        SELECT 
          tc.constraint_name, 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name
        FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name = 'campaigns'
      `;
      console.log("Current FK constraints on campaigns:", constraints);
    } catch (e) {
      console.log("Error checking constraints:", e.message);
    }

    // Try inserting with detailed error logging
    console.log("Attempting to insert campaign...");
    const result = await sql`
      INSERT INTO campaigns (
        company_id, campaign_name, target_country, email_template, status,
        total_recipients, emails_sent, open_rate, response_rate, conversion_rate
      ) VALUES (
        ${company_id || null}, ${campaign_name}, ${target_country || null}, ${email_template || null}, ${status || "Draft"},
        ${total_recipients || 0}, ${emails_sent || 0}, ${open_rate || 0}, ${response_rate || 0}, ${conversion_rate || 0}
      ) RETURNING *
    `;

    console.log("Campaign created successfully:", result[0]);
    return Response.json({ campaign: result[0] });
  } catch (error) {
    console.error("=== CAMPAIGN CREATION ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error detail:", error.detail);
    console.error("Full error:", error);

    return Response.json(
      {
        error: "Failed to create campaign",
        details: error.message,
        code: error.code,
        constraint: error.constraint,
      },
      { status: 500 },
    );
  }
}
