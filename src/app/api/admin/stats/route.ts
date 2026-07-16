import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { withAdmin, withLogging } from "@/lib/api-middleware";
import type { Purchase } from "@/lib/types";

/** GET /api/admin/stats — admin only. Aggregate numbers for the admin dashboard. */
export const GET = withLogging(
  withAdmin(async () => {
    const [{ count: totalUsers }] = await sql<{ count: string }[]>`
      select count(*)::text from users
    `;
    const [{ count: totalMovies }] = await sql<{ count: string }[]>`
      select count(*)::text from movies
    `;
    const [{ count: totalSales, revenue }] = await sql<
      { count: string; revenue: string }[]
    >`
      select count(*)::text, coalesce(sum(price), 0)::text as revenue from purchases
    `;

    const recentSales = await sql<
      (Purchase & { movie_title: string; user_email: string })[]
    >`
      select p.*, m.title as movie_title, u.email as user_email
      from purchases p
      join movies m on m.id = p.movie_id
      join users u on u.id = p.user_id
      order by p.created_at desc
      limit 10
    `;

    return NextResponse.json({
      totalUsers: Number(totalUsers),
      totalMovies: Number(totalMovies),
      totalSales: Number(totalSales),
      revenue: Number(revenue),
      recentSales,
    });
  })
);
