import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { movieImportSchema, movieListQuerySchema } from "@/lib/validation";
import { jsonError, withAdmin, withLogging } from "@/lib/api-middleware";
import { getOmdbByImdbId, primaryGenre } from "@/lib/omdb";
import type { Movie } from "@/lib/types";

/** GET /api/movies?search=&genre=&offset=&limit= — public catalog listing, filtered + paginated. */
export const GET = withLogging(async (request: NextRequest) => {
  const parsed = movieListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );
  if (!parsed.success) {
    return jsonError(400, "Query inválido", parsed.error.flatten());
  }
  const { search, genre, offset, limit } = parsed.data;

  const searchPattern = search ? `%${search}%` : null;

  const items = await sql<Movie[]>`
    select * from movies
    where (${searchPattern}::text is null or title ilike ${searchPattern})
      and (${genre ?? null}::text is null or genre = ${genre ?? null})
    order by created_at desc
    limit ${limit} offset ${offset}
  `;

  const [{ count }] = await sql<{ count: string }[]>`
    select count(*)::text from movies
    where (${searchPattern}::text is null or title ilike ${searchPattern})
      and (${genre ?? null}::text is null or genre = ${genre ?? null})
  `;

  const total = Number(count);

  const genreRows = await sql<{ genre: string }[]>`
    select distinct genre from movies where genre is not null order by genre
  `;

  return NextResponse.json({
    items,
    total,
    offset,
    limit,
    hasMore: offset + items.length < total,
    genres: genreRows.map((r) => r.genre),
  });
});

/** POST /api/movies — admin only. Imports a title from OMDb by imdbId with admin-set prices. */
export const POST = withLogging(
  withAdmin(async (request) => {
    const body = await request.json().catch(() => null);
    const parsed = movieImportSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "Datos inválidos", parsed.error.flatten());
    }
    const { imdbId, priceBuy, priceRent } = parsed.data;

    const existing = await sql<{ id: string }[]>`
      select id from movies where imdb_id = ${imdbId}
    `;
    if (existing.length > 0) {
      return jsonError(409, "Esa película ya está en el catálogo");
    }

    const omdbMovie = await getOmdbByImdbId(imdbId);
    if (!omdbMovie) {
      return jsonError(404, "No se encontró esa película en OMDb");
    }

    const [movie] = await sql<Movie[]>`
      insert into movies (
        imdb_id, title, year, poster_url, genre, plot, imdb_rating, price_buy, price_rent
      ) values (
        ${imdbId},
        ${omdbMovie.Title},
        ${omdbMovie.Year},
        ${omdbMovie.Poster === "N/A" ? null : omdbMovie.Poster},
        ${primaryGenre(omdbMovie.Genre)},
        ${omdbMovie.Plot},
        ${omdbMovie.imdbRating},
        ${priceBuy},
        ${priceRent}
      )
      returning *
    `;

    return NextResponse.json(movie, { status: 201 });
  })
);
