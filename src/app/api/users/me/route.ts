import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validation";
import { jsonError, withAuth, withLogging } from "@/lib/api-middleware";
import type { PublicUser } from "@/lib/types";

/** GET /api/users/me — the current user's own profile. */
export const GET = withLogging(
  withAuth(async (_request, _context, session) => {
    const [user] = await sql<PublicUser[]>`
      select id, email, name, role, balance, avatar_url, created_at
      from users where id = ${session.userId}
    `;
    if (!user) return jsonError(404, "Usuario no encontrado");
    return NextResponse.json(user);
  })
);

/** PATCH /api/users/me — self-service update of name and/or avatar. */
export const PATCH = withLogging(
  withAuth(async (request: NextRequest, _context, session) => {
    const body = await request.json().catch(() => null);
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "Datos inválidos", parsed.error.flatten());
    }
    const { name, avatarUrl } = parsed.data;
    if (name === undefined && avatarUrl === undefined) {
      return jsonError(400, "Nada que actualizar");
    }

    const [user] = await sql<PublicUser[]>`
      update users
      set name = coalesce(${name ?? null}, name),
          avatar_url = case when ${avatarUrl !== undefined} then ${avatarUrl ?? null} else avatar_url end
      where id = ${session.userId}
      returning id, email, name, role, balance, avatar_url, created_at
    `;
    return NextResponse.json(user);
  })
);
