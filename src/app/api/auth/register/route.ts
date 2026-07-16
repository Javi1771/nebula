import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { registerSchema } from "@/lib/validation";
import { signSession, setSessionCookie } from "@/lib/session";
import { jsonError, withLogging } from "@/lib/api-middleware";
import type { User } from "@/lib/types";

export const POST = withLogging(async (request: NextRequest) => {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "Datos inválidos", parsed.error.flatten());
  }
  const { name, email, password } = parsed.data;

  const existing = await sql<{ id: string }[]>`
    select id from users where email = ${email}
  `;
  if (existing.length > 0) {
    return jsonError(409, "Ya existe una cuenta con ese email");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await sql<Pick<User, "id" | "role">[]>`
    insert into users (email, password_hash, name, role)
    values (${email}, ${passwordHash}, ${name}, 'user')
    returning id, role
  `;

  const token = await signSession({ userId: user.id, role: user.role });
  await setSessionCookie(token);

  return NextResponse.json(
    { id: user.id, email, name, role: user.role },
    { status: 201 }
  );
});
