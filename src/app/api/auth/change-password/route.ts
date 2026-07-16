import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { changePasswordSchema } from "@/lib/validation";
import { jsonError, withAuth, withLogging } from "@/lib/api-middleware";
import type { User } from "@/lib/types";

/** POST /api/auth/change-password — verifies the current password before setting a new hash. */
export const POST = withLogging(
  withAuth(async (request: NextRequest, _context, session) => {
    const body = await request.json().catch(() => null);
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "Datos inválidos", parsed.error.flatten());
    }
    const { currentPassword, newPassword } = parsed.data;

    const [user] = await sql<User[]>`select * from users where id = ${session.userId}`;
    if (!user) return jsonError(404, "Usuario no encontrado");

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return jsonError(401, "La contraseña actual no es correcta");

    const newHash = await bcrypt.hash(newPassword, 10);
    await sql`update users set password_hash = ${newHash} where id = ${session.userId}`;

    return NextResponse.json({ ok: true });
  })
);
