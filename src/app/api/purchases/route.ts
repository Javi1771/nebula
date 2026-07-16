import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { purchaseSchema } from "@/lib/validation";
import { jsonError, withAuth, withLogging } from "@/lib/api-middleware";
import { RENTAL_HOURS } from "@/lib/constants";
import type { Movie, Purchase, User } from "@/lib/types";

/** GET /api/purchases — the current user's purchase/rental history, newest first, with movie details. */
export const GET = withLogging(
  withAuth(async (_request, _context, session) => {
    const rows = await sql<(Purchase & { movie: Movie })[]>`
      select
        p.*,
        row_to_json(m.*) as movie
      from purchases p
      join movies m on m.id = p.movie_id
      where p.user_id = ${session.userId}
      order by p.created_at desc
    `;
    return NextResponse.json(rows);
  })
);

/** POST /api/purchases — buy or rent a movie. Validates balance and prevents redundant duplicate access. */
export const POST = withLogging(
  withAuth(async (request: NextRequest, _context, session) => {
    const body = await request.json().catch(() => null);
    const parsed = purchaseSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "Datos inválidos", parsed.error.flatten());
    }
    const { movieId, type } = parsed.data;

    try {
      const purchase = await sql.begin(async (tx) => {
        const [user] = await tx<User[]>`
          select * from users where id = ${session.userId} for update
        `;
        const [movie] = await tx<Movie[]>`
          select * from movies where id = ${movieId}
        `;
        if (!movie) throw new ApiError(404, "Película no encontrada");

        const [ownsPurchase] = await tx<Purchase[]>`
          select * from purchases
          where user_id = ${session.userId} and movie_id = ${movieId} and type = 'buy'
        `;
        if (ownsPurchase) {
          throw new ApiError(409, "Ya compraste esta película");
        }

        if (type === "rent") {
          const [activeRent] = await tx<Purchase[]>`
            select * from purchases
            where user_id = ${session.userId}
              and movie_id = ${movieId}
              and type = 'rent'
              and rented_until > now()
          `;
          if (activeRent) {
            throw new ApiError(409, "Ya tienes una renta activa de esta película");
          }
        }

        const price = type === "buy" ? movie.price_buy : movie.price_rent;
        if (Number(user.balance) < Number(price)) {
          throw new ApiError(402, "Saldo insuficiente");
        }

        const rentedUntil =
          type === "rent"
            ? new Date(Date.now() + RENTAL_HOURS * 60 * 60 * 1000)
            : null;

        const [inserted] = await tx<Purchase[]>`
          insert into purchases (user_id, movie_id, type, price, rented_until)
          values (${session.userId}, ${movieId}, ${type}, ${price}, ${rentedUntil})
          returning *
        `;

        await tx`
          update users set balance = balance - ${price} where id = ${session.userId}
        `;

        return inserted;
      });

      return NextResponse.json(purchase, { status: 201 });
    } catch (err) {
      if (err instanceof ApiError) {
        return jsonError(err.status, err.message);
      }
      throw err;
    }
  })
);

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
