import sql from "@/app/api/utils/sql";

export async function DELETE() {
  try {
    // Use mock user ID for now (comment out when auth is working)
    const mockUserId = 1;

    // Delete user data in the correct order (due to foreign key constraints)
    await sql.transaction([
      // Delete from tables that reference auth_users
      sql`DELETE FROM companies WHERE user_id = ${mockUserId}`,
      sql`DELETE FROM auth_sessions WHERE "userId" = ${mockUserId}`,
      sql`DELETE FROM auth_accounts WHERE "userId" = ${mockUserId}`,
      // Finally delete the user
      sql`DELETE FROM auth_users WHERE id = ${mockUserId}`,
    ]);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
