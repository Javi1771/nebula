import Image from "next/image";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PlaceholderArt } from "@/components/PlaceholderArt";
import { PriceBadge } from "@/components/PriceBadge";
import { BuyRentButtons } from "@/components/BuyRentButtons";
import { StarIcon } from "@/components/StarIcon";
import type { Movie, Purchase } from "@/lib/types";

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [movie] = await sql<Movie[]>`select * from movies where id = ${id}`;
  if (!movie) notFound();

  const user = await getCurrentUser();

  let owned = false;
  let activeRentUntil: string | null = null;

  if (user) {
    const purchases = await sql<Purchase[]>`
      select * from purchases
      where user_id = ${user.id} and movie_id = ${movie.id}
      order by created_at desc
    `;
    owned = purchases.some((p) => p.type === "buy");
    const activeRent = purchases.find(
      (p) => p.type === "rent" && p.rented_until && new Date(p.rented_until) > new Date()
    );
    activeRentUntil = activeRent?.rented_until ?? null;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 animate-fade-up">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-[300px_1fr]">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl shadow-card">
          {movie.poster_url ? (
            <Image
              src={movie.poster_url}
              alt={movie.title}
              fill
              sizes="300px"
              className="object-cover"
              priority
            />
          ) : (
            <PlaceholderArt className="absolute inset-0 rounded-none" />
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">{movie.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
            <span>{movie.year ?? "—"}</span>
            {movie.genre && (
              <>
                <span aria-hidden className="h-1 w-1 rounded-full bg-accent-secondary/60" />
                <span>{movie.genre}</span>
              </>
            )}
            {movie.imdb_rating && (
              <>
                <span aria-hidden className="h-1 w-1 rounded-full bg-accent-secondary/60" />
                <span className="inline-flex items-center gap-1 font-medium text-text">
                  <StarIcon />
                  {movie.imdb_rating} IMDb
                </span>
              </>
            )}
          </div>

          <p className="mt-5 max-w-lg leading-relaxed text-text-secondary">{movie.plot}</p>

          <div className="mt-5 flex gap-2">
            <PriceBadge label="Comprar" price={movie.price_buy} />
            <PriceBadge label="Rentar" price={movie.price_rent} tone="secondary" />
          </div>

          <div className="mt-7">
            <BuyRentButtons
              movieId={movie.id}
              movieTitle={movie.title}
              posterUrl={movie.poster_url}
              priceBuy={movie.price_buy}
              priceRent={movie.price_rent}
              isLoggedIn={Boolean(user)}
              owned={owned}
              activeRentUntil={activeRentUntil}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
