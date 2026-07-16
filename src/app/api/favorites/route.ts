import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { favoriteSchema } from "@/lib/validation";
import { jsonError, withAuth, withLogging } from "@/lib/api-middleware";
import type { Favorite, Movie } from "@/lib/types";

/** GET /api/favorites — the current user's favorited titles, newest first, with movie details. */
export const GET = withLogging(
  withAuth(async (_request, _context, session) => {
    const rows = await sql<(Favorite & { movie: Movie })[]>`
      select f.*, row_to_json(m.*) as movie
      from favorites f
      join movies m on m.id = f.movie_id
      where f.user_id = ${session.userId}
      order by f.created_at desc
    `;
    return NextResponse.json(rows);
  })
);

/** POST /api/favorites — add a title to favorites (idempotent). */
export const POST = withLogging(
  withAuth(async (request: NextRequest, _context, session) => {
    const body = await request.json().catch(() => null);
    const parsed = favoriteSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "Datos inválidos", parsed.error.flatten());
    }
    const { movieId } = parsed.data;

    const [movie] = await sql<{ id: string }[]>`select id from movies where id = ${movieId}`;
    if (!movie) return jsonError(404, "Película no encontrada");

    const [favorite] = await sql<Favorite[]>`
      insert into favorites (user_id, movie_id)
      values (${session.userId}, ${movieId})
      on conflict (user_id, movie_id) do nothing
      returning *
    `;

    return NextResponse.json(favorite ?? { ok: true }, { status: 201 });
  })
);

/** DELETE /api/favorites?movieId= — remove a title from favorites. */
export const DELETE = withLogging(
  withAuth(async (request: NextRequest, _context, session) => {
    const movieId = request.nextUrl.searchParams.get("movieId");
    const parsed = favoriteSchema.safeParse({ movieId });
    if (!parsed.success) {
      return jsonError(400, "Datos inválidos", parsed.error.flatten());
    }

    await sql`
      delete from favorites where user_id = ${session.userId} and movie_id = ${parsed.data.movieId}
    `;
    return NextResponse.json({ ok: true });
  })
);
