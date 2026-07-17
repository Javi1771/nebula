import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { movieImportSchema, movieListQuerySchema } from "@/lib/validation";
import { jsonError, withAdmin, withLogging } from "@/lib/api-middleware";
import { getDetail, posterUrl, backdropUrl, titleOf, yearOf } from "@/lib/tmdb";
import { slugify } from "@/lib/slug";
import type { Movie } from "@/lib/types";

/** GET /api/movies?search=&genre=&type=&offset=&limit= — public catalog listing, filtered + paginated. */
export const GET = withLogging(async (request: NextRequest) => {
  const parsed = movieListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );
  if (!parsed.success) {
    return jsonError(400, "Query inválido", parsed.error.flatten());
  }
  const { search, genre, type, collection, sort, offset, limit } = parsed.data;

  const searchPattern = search ? `%${search}%` : null;
  const trendingDayOnly = collection === "trending_day";
  const trendingWeekOnly = collection === "trending_week";

  const orderBy = {
    popular: sql`popularity desc nulls last, vote_average desc nulls last`,
    rating: sql`vote_average desc nulls last, popularity desc nulls last`,
    recent: sql`year desc nulls last, popularity desc nulls last`,
    title: sql`title asc`,
  }[sort];

  // Genre links in the UI use a clean accent-free slug (e.g. "ciencia-ficcion") instead of the
  // raw TMDB name, so resolve it back to the exact DB value the `genres` array actually stores.
  const genreRows = await sql<{ genre: string; count: string }[]>`
    select unnest(genres) as genre, count(*)::text as count
    from movies group by 1 order by count(*) desc, genre asc
  `;
  const resolvedGenre = genre
    ? genreRows.find((r) => slugify(r.genre) === slugify(genre))?.genre ?? genre
    : null;

  const items = await sql<Movie[]>`
    select * from movies
    where (${searchPattern}::text is null or title ilike ${searchPattern})
      and (${resolvedGenre}::text is null or ${resolvedGenre} = any(genres))
      and (${type ?? null}::text is null or media_type = ${type ?? null})
      and (${!trendingDayOnly} or trending_day)
      and (${!trendingWeekOnly} or trending_week)
    order by ${orderBy}
    limit ${limit} offset ${offset}
  `;

  const [{ count }] = await sql<{ count: string }[]>`
    select count(*)::text from movies
    where (${searchPattern}::text is null or title ilike ${searchPattern})
      and (${resolvedGenre}::text is null or ${resolvedGenre} = any(genres))
      and (${type ?? null}::text is null or media_type = ${type ?? null})
      and (${!trendingDayOnly} or trending_day)
      and (${!trendingWeekOnly} or trending_week)
  `;

  const total = Number(count);

  return NextResponse.json({
    items,
    total,
    offset,
    limit,
    hasMore: offset + items.length < total,
    genres: genreRows.map((r) => ({ name: r.genre, count: Number(r.count) })),
  });
});

/** POST /api/movies — admin only. Imports a title from TMDB by tmdbId + mediaType with admin-set prices. */
export const POST = withLogging(
  withAdmin(async (request) => {
    const body = await request.json().catch(() => null);
    const parsed = movieImportSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "Datos inválidos", parsed.error.flatten());
    }
    const { tmdbId, mediaType, priceBuy, priceRent } = parsed.data;

    const existing = await sql<{ id: string }[]>`
      select id from movies where tmdb_id = ${tmdbId} and media_type = ${mediaType}
    `;
    if (existing.length > 0) {
      return jsonError(409, "Ese título ya está en el catálogo");
    }

    let detail;
    try {
      detail = await getDetail(mediaType, tmdbId);
    } catch {
      return jsonError(404, "No se encontró ese título en TMDB");
    }

    const runtime =
      detail.runtime ?? (detail.episode_run_time?.length ? detail.episode_run_time[0] : null);

    const [movie] = await sql<Movie[]>`
      insert into movies (
        tmdb_id, media_type, title, year, poster_url, backdrop_url,
        genres, overview, vote_average, runtime, number_of_seasons, number_of_episodes,
        tagline, popularity, price_buy, price_rent
      ) values (
        ${tmdbId},
        ${mediaType},
        ${titleOf(detail)},
        ${yearOf(detail)},
        ${posterUrl(detail.poster_path)},
        ${backdropUrl(detail.backdrop_path)},
        ${sql.array(detail.genres.map((g) => g.name))},
        ${detail.overview ?? null},
        ${detail.vote_average?.toFixed(1) ?? null},
        ${runtime},
        ${mediaType === "tv" ? detail.number_of_seasons ?? null : null},
        ${mediaType === "tv" ? detail.number_of_episodes ?? null : null},
        ${detail.tagline || null},
        ${detail.popularity?.toFixed(2) ?? null},
        ${priceBuy},
        ${priceRent}
      )
      returning *
    `;

    return NextResponse.json(movie, { status: 201 });
  })
);
