import sql from "@/app/api/utils/sql";
// Temporarily commenting out auth import due to import issues
// import { auth } from '@/auth';

export async function GET() {
  try {
    // const session = await auth();
    // if (!session || !session.user?.id) {
    //   return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Use mock user ID for now
    const mockUserId = 1;

    const [user] = await sql`
      SELECT id, name, email, image, company_name, industry, country, 
             phone, address, website
      FROM auth_users 
      WHERE id = ${mockUserId} 
      LIMIT 1
    `;

    return Response.json({ user: user || null });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    // const session = await auth();
    // if (!session || !session.user?.id) {
    //   return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Use mock user ID for now
    const mockUserId = 1;

    const body = await request.json();
    const { name, company_name, industry, country, phone, address, website } =
      body || {};

    const setClauses = [];
    const values = [];

    if (typeof name === "string" && name.trim().length > 0) {
      setClauses.push("name = $" + (values.length + 1));
      values.push(name.trim());
    }

    if (typeof company_name === "string") {
      setClauses.push("company_name = $" + (values.length + 1));
      values.push(company_name.trim());
    }

    if (typeof industry === "string") {
      setClauses.push("industry = $" + (values.length + 1));
      values.push(industry.trim());
    }

    if (typeof country === "string") {
      setClauses.push("country = $" + (values.length + 1));
      values.push(country.trim());
    }

    if (typeof phone === "string") {
      setClauses.push("phone = $" + (values.length + 1));
      values.push(phone.trim());
    }

    if (typeof address === "string") {
      setClauses.push("address = $" + (values.length + 1));
      values.push(address.trim());
    }

    if (typeof website === "string") {
      setClauses.push("website = $" + (values.length + 1));
      values.push(website.trim());
    }

    if (setClauses.length === 0) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const finalQuery = `
      UPDATE auth_users 
      SET ${setClauses.join(", ")} 
      WHERE id = $${values.length + 1}
      RETURNING id, name, email, image, company_name, industry, 
                country, phone, address, website
    `;

    const [updated] = await sql(finalQuery, [...values, mockUserId]);

    return Response.json({ user: updated });
  } catch (error) {
    console.error("PUT /api/profile error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
