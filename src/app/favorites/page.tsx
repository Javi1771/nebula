import Link from "next/link";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { MovieCard } from "@/components/MovieCard";
import { HeartIcon, SearchIcon } from "@/components/icons";
import { BackButton } from "@/components/BackButton";
import type { Favorite, Movie } from "@/lib/types";

export default async function FavoritesPage() {
  const user = await requireUser();

  const favorites = await sql<(Favorite & { movie: Movie })[]>`
    select f.*, row_to_json(m.*) as movie
    from favorites f
    join movies m on m.id = f.movie_id
    where f.user_id = ${user.id}
    order by f.created_at desc
  `;

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10 animate-fade-up">
      <BackButton fallback="/" label="Volver al catálogo" className="mb-6" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-nebula text-ink shadow-pop">
            <HeartIcon className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">Favoritos</h1>
            <p className="text-sm text-text-secondary">
              {favorites.length > 0
                ? `${favorites.length} título${favorites.length === 1 ? "" : "s"} guardado${favorites.length === 1 ? "" : "s"} para ver después`
                : "Títulos que marcaste para ver después"}
            </p>
          </div>
        </div>

        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-accent-alt shadow-card transition-all hover:border-accent hover:shadow-pop"
        >
          <SearchIcon className="h-4 w-4" />
          Descubrir más
        </Link>
      </div>

      {favorites.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-elevated">
            <HeartIcon className="h-7 w-7 text-accent-secondary-alt" />
          </span>
          <p className="text-lg font-semibold text-text">Aún no tienes favoritos</p>
          <p className="max-w-sm text-sm text-text-secondary">
            Toca el corazón en cualquier título del catálogo para guardarlo aquí y encontrarlo al instante.
          </p>
          <Link
            href="/"
            className="mt-2 rounded-full bg-gradient-nebula px-6 py-2.5 text-sm font-semibold text-ink shadow-pop transition-transform hover:scale-[1.03] active:scale-95"
          >
            Explorar el catálogo
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5 pb-14 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-14 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {favorites.map((f, i) => (
            <div key={f.id} className={i % 2 === 1 ? "sm:translate-y-8" : ""}>
              <MovieCard movie={f.movie} isLoggedIn isFavorite />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
