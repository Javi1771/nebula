import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { withAdmin, withLogging } from "@/lib/api-middleware";
import type { PublicUser } from "@/lib/types";

/** GET /api/users — admin only, read-only listing. */
export const GET = withLogging(
  withAdmin(async () => {
    const users = await sql<PublicUser[]>`
      select id, email, name, role, balance, created_at
      from users
      order by created_at desc
    `;
    return NextResponse.json(users);
  })
);
