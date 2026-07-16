import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import postgres from "postgres";
import bcrypt from "bcryptjs";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

/** How many pages of each list to pull. 1 page = 20 titles. */
const POPULAR_MOVIE_PAGES = 5;
const POPULAR_TV_PAGES = 4;
const TOP_RATED_MOVIE_PAGES = 2;
const TOP_RATED_TV_PAGES = 2;
const DETAIL_CONCURRENCY = 8;

type MediaType = "movie" | "tv";

interface TmdbListItem {
  id: number;
  media_type?: string;
}

interface TmdbDetail {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  popularity: number;
  tagline: string | null;
  genres: { id: number; name: string }[];
  runtime?: number | null;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
}

// Kept as a self-contained fetch helper (rather than importing lib/tmdb.ts) because
// that module is marked "server-only" for the Next.js request lifecycle, which this
// standalone script running under tsx isn't part of.
async function tmdbFetch<T>(path: string, token: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set("language", "es-MX");
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`TMDB ${path} failed: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

async function fetchListIds(
  token: string,
  path: string,
  pages: number,
  mediaType?: MediaType
): Promise<{ id: number; mediaType: MediaType }[]> {
  const out: { id: number; mediaType: MediaType }[] = [];
  for (let page = 1; page <= pages; page++) {
    const data = await tmdbFetch<{ results: TmdbListItem[] }>(path, token, { page });
    for (const item of data.results) {
      const type = mediaType ?? (item.media_type === "tv" ? "tv" : item.media_type === "movie" ? "movie" : null);
      if (type) out.push({ id: item.id, mediaType: type });
    }
  }
  return out;
}

/** Simple promise pool so ~200 detail lookups don't hammer TMDB all at once. */
async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const tmdbToken = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  if (!tmdbToken) throw new Error("TMDB_READ_ACCESS_TOKEN is not set");

  const sql = postgres(connectionString, { ssl: "require" });

  console.log("Seeding demo users...");
  const adminHash = await bcrypt.hash("admin1234", 10);
  const userHash = await bcrypt.hash("user1234", 10);

  await sql`
    insert into users (email, password_hash, name, role)
    values (${"admin@demo.com"}, ${adminHash}, ${"Admin Demo"}, ${"admin"})
    on conflict (email) do nothing
  `;
  await sql`
    insert into users (email, password_hash, name, role)
    values (${"user@demo.com"}, ${userHash}, ${"Usuario Demo"}, ${"user"})
    on conflict (email) do nothing
  `;

  console.log("Fetching TMDB lists (popular, top rated, trending day/week)...");
  const [popularMovies, popularTv, topMovies, topTv, trendingDay, trendingWeek] = await Promise.all([
    fetchListIds(tmdbToken, "/movie/popular", POPULAR_MOVIE_PAGES, "movie"),
    fetchListIds(tmdbToken, "/tv/popular", POPULAR_TV_PAGES, "tv"),
    fetchListIds(tmdbToken, "/movie/top_rated", TOP_RATED_MOVIE_PAGES, "movie"),
    fetchListIds(tmdbToken, "/tv/top_rated", TOP_RATED_TV_PAGES, "tv"),
    fetchListIds(tmdbToken, "/trending/all/day", 1),
    fetchListIds(tmdbToken, "/trending/all/week", 1),
  ]);

  const trendingDayKeys = new Set(trendingDay.map((t) => `${t.mediaType}:${t.id}`));
  const trendingWeekKeys = new Set(trendingWeek.map((t) => `${t.mediaType}:${t.id}`));

  const unique = new Map<string, { id: number; mediaType: MediaType }>();
  for (const entry of [...popularMovies, ...popularTv, ...topMovies, ...topTv, ...trendingDay, ...trendingWeek]) {
    unique.set(`${entry.mediaType}:${entry.id}`, entry);
  }
  const catalog = [...unique.values()];
  console.log(`Fetching full details for ${catalog.length} unique titles...`);

  let imported = 0;
  let failed = 0;

  await mapWithConcurrency(catalog, DETAIL_CONCURRENCY, async ({ id, mediaType }) => {
    let detail: TmdbDetail;
    try {
      detail = await tmdbFetch<TmdbDetail>(`/${mediaType}/${id}`, tmdbToken);
    } catch (err) {
      failed++;
      console.warn(`  skipped ${mediaType}:${id} — ${err instanceof Error ? err.message : err}`);
      return;
    }

    const title = detail.title ?? detail.name ?? "Sin título";
    const dateStr = detail.release_date ?? detail.first_air_date;
    const year = dateStr ? dateStr.slice(0, 4) : null;
    const genres = detail.genres.map((g) => g.name);
    const runtime =
      detail.runtime ?? (detail.episode_run_time?.length ? detail.episode_run_time[0] : null);
    const key = `${mediaType}:${id}`;

    const priceBuy = (9.99 + Math.random() * 10).toFixed(2);
    const priceRent = (2.99 + Math.random() * 3).toFixed(2);

    // Upsert (instead of truncate + insert) so re-seeding never orphans purchases or favorites.
    await sql`
      insert into movies (
        tmdb_id, media_type, title, year, poster_url, backdrop_url,
        genres, overview, vote_average, runtime, number_of_seasons, number_of_episodes,
        tagline, popularity, trending_day, trending_week, price_buy, price_rent
      ) values (
        ${id},
        ${mediaType},
        ${title},
        ${year},
        ${detail.poster_path ? `${TMDB_IMAGE_BASE}/w500${detail.poster_path}` : null},
        ${detail.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${detail.backdrop_path}` : null},
        ${sql.array(genres)},
        ${detail.overview || null},
        ${detail.vote_average?.toFixed(1) ?? null},
        ${runtime},
        ${mediaType === "tv" ? detail.number_of_seasons ?? null : null},
        ${mediaType === "tv" ? detail.number_of_episodes ?? null : null},
        ${detail.tagline || null},
        ${detail.popularity?.toFixed(2) ?? null},
        ${trendingDayKeys.has(key)},
        ${trendingWeekKeys.has(key)},
        ${priceBuy},
        ${priceRent}
      )
      on conflict (tmdb_id, media_type) where tmdb_id is not null do update set
        title = excluded.title,
        year = excluded.year,
        poster_url = excluded.poster_url,
        backdrop_url = excluded.backdrop_url,
        genres = excluded.genres,
        overview = excluded.overview,
        vote_average = excluded.vote_average,
        runtime = excluded.runtime,
        number_of_seasons = excluded.number_of_seasons,
        number_of_episodes = excluded.number_of_episodes,
        tagline = excluded.tagline,
        popularity = excluded.popularity,
        trending_day = excluded.trending_day,
        trending_week = excluded.trending_week
    `;
    imported++;
    if (imported % 25 === 0) console.log(`  ${imported}/${catalog.length} imported...`);
  });

  // Titles that fell out of today's/this week's trending keep stale flags otherwise.
  const dayEntries = [...trendingDayKeys];
  const weekEntries = [...trendingWeekKeys];
  await sql`
    update movies set trending_day = (media_type || ':' || tmdb_id::text) = any(${sql.array(dayEntries)}),
                      trending_week = (media_type || ':' || tmdb_id::text) = any(${sql.array(weekEntries)})
    where tmdb_id is not null
  `;

  console.log(`Seed complete. ${imported} titles imported/updated, ${failed} skipped.`);
  console.log(`Trending today: ${trendingDayKeys.size} · trending this week: ${trendingWeekKeys.size}`);
  console.log("Demo credentials:");
  console.log("  admin@demo.com / admin1234");
  console.log("  user@demo.com  / user1234");

  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
