import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { loginSchema } from "@/lib/validation";
import { signSession, setSessionCookie } from "@/lib/session";
import { jsonError, withLogging } from "@/lib/api-middleware";
import type { User } from "@/lib/types";

export const POST = withLogging(async (request: NextRequest) => {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "Datos inválidos", parsed.error.flatten());
  }
  const { email, password } = parsed.data;

  const [user] = await sql<User[]>`
    select * from users where email = ${email}
  `;
  if (!user) {
    return jsonError(401, "Email o contraseña incorrectos");
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return jsonError(401, "Email o contraseña incorrectos");
  }

  const token = await signSession({ userId: user.id, role: user.role });
  await setSessionCookie(token);

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    balance: user.balance,
  });
});
