import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    if (!companyId) {
      return Response.json({ error: "Company ID required" }, { status: 400 });
    }

    const products = await sql`
      SELECT * FROM products 
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
    `;

    return Response.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      company_id,
      product_name,
      hs_code,
      category,
      material,
      technical_specs,
      unit_price,
      currency,
      description,
    } = body;

    const result = await sql`
      INSERT INTO products (
        company_id, product_name, hs_code, category, material, 
        technical_specs, unit_price, currency, description
      ) VALUES (
        ${company_id}, ${product_name}, ${hs_code}, ${category}, ${material},
        ${technical_specs}, ${unit_price}, ${currency}, ${description}
      ) RETURNING *
    `;

    return Response.json({ product: result[0] });
  } catch (error) {
    console.error("Error creating product:", error);
    return Response.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
