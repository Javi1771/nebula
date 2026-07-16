import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { withAuth, withLogging } from "@/lib/api-middleware";

/** GET /api/favorites/ids — just the movie_ids the current user favorited, for lightweight heart-state checks. */
export const GET = withLogging(
  withAuth(async (_request, _context, session) => {
    const rows = await sql<{ movie_id: string }[]>`
      select movie_id from favorites where user_id = ${session.userId}
    `;
    return NextResponse.json(rows.map((r) => r.movie_id));
  })
);
