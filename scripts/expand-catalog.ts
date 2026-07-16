import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import postgres from "postgres";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

/**
 * Expands the catalog until ~TARGET_COVERAGE of the "También te puede interesar"
 * slots across the whole catalog point at titles that exist in the database.
 * It crawls the exact source the detail page uses (top RECS_PER_TITLE TMDB
 * recommendations per title), so coverage here maps 1:1 to what users see.
 */
const TARGET_COVERAGE = 0.9;
/** Must match the `.slice(0, 8)` in src/app/movies/[id]/page.tsx. */
const RECS_PER_TITLE = 8;
const MAX_PASSES = 4;
const CONCURRENCY = 8;

type MediaType = "movie" | "tv";

interface TmdbRecItem {
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

const keyOf = (mediaType: string, id: number) => `${mediaType}:${id}`;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const tmdbToken = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  if (!tmdbToken) throw new Error("TMDB_READ_ACCESS_TOKEN is not set");

  const sql = postgres(connectionString, { ssl: "require" });

  const rows = await sql<{ tmdb_id: number; media_type: MediaType }[]>`
    select tmdb_id, media_type from movies where tmdb_id is not null
  `;
  const inCatalog = new Set(rows.map((r) => keyOf(r.media_type, r.tmdb_id)));
  console.log(`Catalog holds ${inCatalog.size} titles. Target: ${TARGET_COVERAGE * 100}% recommendation coverage.`);

  // Titles whose recommendation list we haven't fetched yet. Recs already fetched
  // stay covered forever (their missing items get imported), so each pass only
  // needs to look at titles added by the previous pass.
  let frontier = rows.map((r) => ({ id: r.tmdb_id, mediaType: r.media_type }));

  // key -> top recommendations (kept to recompute coverage without refetching).
  const recsByTitle = new Map<string, string[]>();

  const coverage = () => {
    let covered = 0;
    let total = 0;
    for (const recs of recsByTitle.values()) {
      total += recs.length;
      for (const rec of recs) if (inCatalog.has(rec)) covered++;
    }
    return total ? covered / total : 1;
  };

  let totalImported = 0;

  for (let pass = 1; pass <= MAX_PASSES; pass++) {
    console.log(`\nPass ${pass}: fetching recommendations for ${frontier.length} titles...`);

    const missing = new Map<string, { id: number; mediaType: MediaType }>();

    await mapWithConcurrency(frontier, CONCURRENCY, async ({ id, mediaType }) => {
      let results: TmdbRecItem[];
      try {
        const data = await tmdbFetch<{ results: TmdbRecItem[] }>(`/${mediaType}/${id}/recommendations`, tmdbToken);
        results = data.results;
      } catch (err) {
        console.warn(`  recs failed for ${mediaType}:${id} — ${err instanceof Error ? err.message : err}`);
        return;
      }
      const top = results
        .filter((r) => r.media_type === "movie" || r.media_type === "tv")
        .slice(0, RECS_PER_TITLE);
      recsByTitle.set(
        keyOf(mediaType, id),
        top.map((r) => keyOf(r.media_type!, r.id))
      );
      for (const rec of top) {
        const key = keyOf(rec.media_type!, rec.id);
        if (!inCatalog.has(key)) missing.set(key, { id: rec.id, mediaType: rec.media_type as MediaType });
      }
    });

    console.log(`  Coverage before import: ${(coverage() * 100).toFixed(1)}% — ${missing.size} titles to import.`);

    const toImport = [...missing.values()];
    let imported = 0;
    let failed = 0;

    await mapWithConcurrency(toImport, CONCURRENCY, async ({ id, mediaType }) => {
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

      const priceBuy = (9.99 + Math.random() * 10).toFixed(2);
      const priceRent = (2.99 + Math.random() * 3).toFixed(2);

      await sql`
        insert into movies (
          tmdb_id, media_type, title, year, poster_url, backdrop_url,
          genres, overview, vote_average, runtime, number_of_seasons, number_of_episodes,
          tagline, popularity, price_buy, price_rent
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
          popularity = excluded.popularity
      `;
      inCatalog.add(keyOf(mediaType, id));
      imported++;
      if (imported % 100 === 0) console.log(`  ${imported}/${toImport.length} imported...`);
    });

    totalImported += imported;
    frontier = toImport.filter(({ id, mediaType }) => inCatalog.has(keyOf(mediaType, id)));
    console.log(`  Pass ${pass} done: ${imported} imported, ${failed} skipped. Catalog: ${inCatalog.size} titles.`);

    // The imported titles cover every slot fetched so far; what keeps coverage
    // below 100% is the new titles' own (still unfetched) recommendations. Estimate
    // next-pass coverage pessimistically as if none of those were in catalog yet:
    // if even that floor clears the target, fetching another frontier can't help.
    const knownSlots = [...recsByTitle.values()].reduce((n, r) => n + r.length, 0);
    const pendingSlots = frontier.length * RECS_PER_TITLE;
    const worstCase = knownSlots / (knownSlots + pendingSlots);
    console.log(`  Coverage floor for next pass: ${(worstCase * 100).toFixed(1)}%`);
    if (worstCase >= TARGET_COVERAGE) {
      console.log(`  Floor already clears ${TARGET_COVERAGE * 100}% — stopping.`);
      break;
    }
  }

  console.log(`\nDone. ${totalImported} titles imported. Catalog now holds ${inCatalog.size} titles.`);
  console.log(`Measured coverage over ${recsByTitle.size} fetched titles: ${(coverage() * 100).toFixed(1)}%`);

  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
