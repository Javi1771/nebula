import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import postgres from "postgres";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

/** Mirrors scripts/seed.ts exactly — the "keep" set is whatever a fresh seed would import. */
const POPULAR_MOVIE_PAGES = 5;
const POPULAR_TV_PAGES = 4;
const TOP_RATED_MOVIE_PAGES = 2;
const TOP_RATED_TV_PAGES = 2;

type MediaType = "movie" | "tv";

interface TmdbListItem {
  id: number;
  media_type?: string;
}

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

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const tmdbToken = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  if (!tmdbToken) throw new Error("TMDB_READ_ACCESS_TOKEN is not set");

  const sql = postgres(connectionString, { ssl: "require" });

  console.log("Fetching the seed's reference lists (popular, top rated, trending)...");
  const [popularMovies, popularTv, topMovies, topTv, trendingDay, trendingWeek] = await Promise.all([
    fetchListIds(tmdbToken, "/movie/popular", POPULAR_MOVIE_PAGES, "movie"),
    fetchListIds(tmdbToken, "/tv/popular", POPULAR_TV_PAGES, "tv"),
    fetchListIds(tmdbToken, "/movie/top_rated", TOP_RATED_MOVIE_PAGES, "movie"),
    fetchListIds(tmdbToken, "/tv/top_rated", TOP_RATED_TV_PAGES, "tv"),
    fetchListIds(tmdbToken, "/trending/all/day", 1),
    fetchListIds(tmdbToken, "/trending/all/week", 1),
  ]);
  const keep = new Set(
    [...popularMovies, ...popularTv, ...topMovies, ...topTv, ...trendingDay, ...trendingWeek].map(
      (e) => `${e.mediaType}:${e.id}`
    )
  );
  console.log(`Seed reference set: ${keep.size} titles.`);

  const rows = await sql<{ id: string; tmdb_id: number | null; media_type: MediaType }[]>`
    select id, tmdb_id, media_type from movies
  `;
  const referenced = await sql<{ movie_id: string }[]>`
    select movie_id from purchases
    union
    select movie_id from favorites
  `;
  const referencedIds = new Set(referenced.map((r) => r.movie_id));

  const toDelete = rows.filter((r) => {
    if (referencedIds.has(r.id)) return false; // never touch owned/favorited titles
    if (r.tmdb_id === null) return false; // not TMDB-sourced, leave alone
    return !keep.has(`${r.media_type}:${r.tmdb_id}`);
  });

  console.log(`movies total: ${rows.length}`);
  console.log(`referenced by purchases/favorites (always kept): ${referencedIds.size}`);
  console.log(`matches seed reference set (kept): ${rows.length - toDelete.length - referencedIds.size >= 0 ? rows.length - toDelete.length : "n/a"}`);
  console.log(`to delete: ${toDelete.length}`);

  if (toDelete.length === 0) {
    console.log("Nothing to prune.");
    await sql.end();
    return;
  }

  const ids = toDelete.map((r) => r.id);
  const BATCH = 1000;
  let deleted = 0;
  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    await sql`delete from movies where id = any(${batch}::uuid[])`;
    deleted += batch.length;
    console.log(`  deleted ${deleted}/${ids.length}...`);
  }

  const [{ count }] = await sql<{ count: string }[]>`select count(*)::text as count from movies`;
  console.log(`Done. movies now holds ${count} rows.`);

  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
