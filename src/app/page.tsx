import { CatalogClient } from "@/components/CatalogClient";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { GenreCount, Movie } from "@/lib/types";

export default async function Home() {
  const [user, trendingDay, trendingWeek, genreRows] = await Promise.all([
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
  ]);

  const genreCounts: GenreCount[] = genreRows.map((r) => ({ name: r.genre, count: Number(r.count) }));

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <CatalogClient
        isLoggedIn={Boolean(user)}
        trendingDay={trendingDay}
        trendingWeek={trendingWeek}
        genreCounts={genreCounts}
      />
    </div>
  );
}
