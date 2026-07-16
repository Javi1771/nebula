import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { movieUpdateSchema } from "@/lib/validation";
import { jsonError, withAdmin, withLogging } from "@/lib/api-middleware";
import type { Movie } from "@/lib/types";

type Context = { params: Promise<{ id: string }> };

/** GET /api/movies/:id — public movie detail. */
export const GET = withLogging(async (_request: NextRequest, context: Context) => {
  const { id } = await context.params;
  const [movie] = await sql<Movie[]>`select * from movies where id = ${id}`;
  if (!movie) return jsonError(404, "Película no encontrada");
  return NextResponse.json(movie);
});

/** PUT /api/movies/:id — admin only. Updates buy/rent prices. */
export const PUT = withLogging(
  withAdmin<Context>(async (request, context) => {
    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const parsed = movieUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "Datos inválidos", parsed.error.flatten());
    }
    const { priceBuy, priceRent } = parsed.data;

    const [movie] = await sql<Movie[]>`
      update movies
      set price_buy = coalesce(${priceBuy ?? null}, price_buy),
          price_rent = coalesce(${priceRent ?? null}, price_rent)
      where id = ${id}
      returning *
    `;
    if (!movie) return jsonError(404, "Película no encontrada");
    return NextResponse.json(movie);
  })
);

/** DELETE /api/movies/:id — admin only. */
export const DELETE = withLogging(
  withAdmin<Context>(async (_request, context) => {
    const { id } = await context.params;
    const [movie] = await sql<Movie[]>`
      delete from movies where id = ${id} returning id
    `;
    if (!movie) return jsonError(404, "Película no encontrada");
    return NextResponse.json({ ok: true });
  })
);
