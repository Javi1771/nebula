import { CatalogClient } from "@/components/CatalogClient";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getUpcoming, posterUrl, titleOf, yearOf } from "@/lib/tmdb";
import type { GenreCount, Movie, UpcomingItem } from "@/lib/types";

async function getUpcomingNotInCatalog(): Promise<UpcomingItem[]> {
  const results = await getUpcoming().catch(() => []);
  if (results.length === 0) return [];

  const ids = results.map((r) => r.id);
  const inCatalog = await sql<{ tmdb_id: number }[]>`
    select tmdb_id from movies where media_type = 'movie' and tmdb_id = any(${sql.array(ids)}::int[])
  `;
  const catalogIds = new Set(inCatalog.map((r) => r.tmdb_id));

  return results
    .filter((r) => !catalogIds.has(r.id))
    .slice(0, 12)
    .map((r) => ({
      tmdbId: r.id,
      title: titleOf(r),
      posterUrl: posterUrl(r.poster_path),
      year: yearOf(r),
      voteAverage: r.vote_average ?? null,
    }));
}

export default async function Home() {
  const [user, trendingDay, trendingWeek, genreRows, upcoming] = await Promise.all([
    getCurrentUser(),
    sql<Movie[]>`
      select * from movies where trending_day
      order by popularity desc nulls last limit 20
    `,
    sql<Movie[]>`
      select * from movies where trending_week
      order by popularity desc nulls last limit 20
    `,
    sql<{ genre: string; count: string }[]>`
      select unnest(genres) as genre, count(*)::text as count
      from movies group by 1 order by count(*) desc, genre asc
    `,
    getUpcomingNotInCatalog(),
  ]);

  const genreCounts: GenreCount[] = genreRows.map((r) => ({ name: r.genre, count: Number(r.count) }));

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <CatalogClient
        isLoggedIn={Boolean(user)}
        trendingDay={trendingDay}
        trendingWeek={trendingWeek}
        genreCounts={genreCounts}
        upcoming={upcoming}
      />
    </div>
  );
}
