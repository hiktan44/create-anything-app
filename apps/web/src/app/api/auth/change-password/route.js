import sql from "@/app/api/utils/sql";
import { hash, verify } from "argon2";

export async function POST(request) {
  try {
    // Use mock user ID for now (comment out when auth is working)
    const mockUserId = 1;

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return Response.json(
        { error: "Current password and new password are required" },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return Response.json(
        { error: "New password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    // Get current user and password hash
    const [user] = await sql`
      SELECT au.id, aa.password 
      FROM auth_users au
      LEFT JOIN auth_accounts aa ON au.id = aa."userId" AND aa.type = 'credentials'
      WHERE au.id = ${mockUserId}
      LIMIT 1
    `;

    if (!user || !user.password) {
      return Response.json(
        { error: "User not found or no password set" },
        { status: 404 },
      );
    }

    // Verify current password
    try {
      const isValidPassword = await verify(user.password, currentPassword);
      if (!isValidPassword) {
        return Response.json(
          { error: "Current password is incorrect" },
          { status: 400 },
        );
      }
    } catch (error) {
      console.error("Password verification error:", error);
      return Response.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    // Hash new password
    const hashedNewPassword = await hash(newPassword);

    // Update password in auth_accounts table
    await sql`
      UPDATE auth_accounts 
      SET password = ${hashedNewPassword}
      WHERE "userId" = ${mockUserId} AND type = 'credentials'
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
