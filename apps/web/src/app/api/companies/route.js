import sql from "@/app/api/utils/sql";
// Remove the auth import since it's causing issues
// import { auth } from "@/auth";

export async function POST(request) {
  try {
    console.log("POST /api/companies - Starting request");

    // For now, we'll skip auth check and use a mock user ID
    // const session = await auth();
    // console.log("Session:", session ? "authenticated" : "not authenticated");

    // if (!session || !session.user?.id) {
    //   console.log("No session or user ID");
    //   return Response.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await request.json();
    console.log("Request body:", body);

    const {
      company_name,
      industry,
      country,
      employee_count,
      annual_revenue,
      website,
      description,
    } = body;

    if (!company_name) {
      console.log("Missing company name");
      return Response.json(
        { error: "Company name is required" },
        { status: 400 },
      );
    }

    console.log("About to insert into database...");
    // Use a mock user ID for now
    const mockUserId = 1;

    const result = await sql`
      INSERT INTO companies (
        user_id, company_name, industry, country, employee_count,
        annual_revenue, website, description
      )
      VALUES (
        ${mockUserId},
        ${company_name},
        ${industry || null},
        ${country || null},
        ${employee_count || null},
        ${annual_revenue ? parseFloat(annual_revenue) : null},
        ${website || null},
        ${description || null}
      )
      RETURNING *
    `;

    console.log("Database insert successful:", result);
    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/companies error:", error);
    console.error("Error stack:", error.stack);
    return Response.json(
      { error: "Internal Server Error: " + error.message },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    // const session = await auth();
    // if (!session || !session.user?.id) {
    //   return Response.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Use mock user ID for now
    const mockUserId = 1;

    const companies = await sql`
      SELECT *
      FROM companies
      WHERE user_id = ${mockUserId}
      ORDER BY created_at DESC
    `;

    return Response.json({ companies });
  } catch (error) {
    console.error("GET /api/companies error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
