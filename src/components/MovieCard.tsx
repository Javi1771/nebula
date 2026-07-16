import Image from "next/image";
import Link from "next/link";
import { PlaceholderArt } from "@/components/PlaceholderArt";
import { StarIcon } from "@/components/StarIcon";
import { FavoriteButton } from "@/components/FavoriteButton";
import { TvIcon, FilmIcon, ClockIcon, LayersIcon } from "@/components/icons";
import type { Movie } from "@/lib/types";

interface MovieCardProps {
  movie: Movie;
  isLoggedIn?: boolean;
  isFavorite?: boolean;
}

/** "2 temporadas · 24 cap." for series, "138 min" for movies — whatever data exists. */
export function formatDuration(movie: Movie): string | null {
  if (movie.media_type === "tv") {
    const parts: string[] = [];
    if (movie.number_of_seasons) {
      parts.push(`${movie.number_of_seasons} temporada${movie.number_of_seasons > 1 ? "s" : ""}`);
    }
    if (movie.number_of_episodes) {
      parts.push(`${movie.number_of_episodes} cap.`);
    }
    return parts.length ? parts.join(" · ") : null;
  }
  if (movie.runtime) {
    const h = Math.floor(movie.runtime / 60);
    const m = movie.runtime % 60;
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  }
  return null;
}

export function MovieCard({ movie, isLoggedIn = false, isFavorite = false }: MovieCardProps) {
  const duration = formatDuration(movie);

  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-pop"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        {movie.poster_url ? (
          <Image
            src={movie.poster_url}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <PlaceholderArt className="absolute inset-0 rounded-none" />
        )}

        <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-dark-surface/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-on-dark backdrop-blur">
          {movie.media_type === "tv" ? <TvIcon className="h-3 w-3" /> : <FilmIcon className="h-3 w-3" />}
          {movie.media_type === "tv" ? "Serie" : "Película"}
        </span>

        {/* Tendencia de hoy: solo una orilla de gradiente en el borde izquierdo, discreta. */}
        {movie.trending_day && (
          <span
            aria-hidden
            title="Tendencia de hoy"
            className="absolute left-0 top-0 h-full w-1 bg-gradient-nebula opacity-90"
          />
        )}

        <FavoriteButton
          movieId={movie.id}
          isLoggedIn={isLoggedIn}
          initialFavorited={isFavorite}
          className="absolute right-2 top-2"
        />

        {movie.vote_average && (
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-dark-surface/85 px-2 py-1 text-[11px] font-bold text-on-dark backdrop-blur">
            <StarIcon className="h-3 w-3 text-accent-tertiary" />
            {movie.vote_average}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h3 className="line-clamp-1 text-sm font-semibold text-text transition-colors group-hover:text-accent">
          {movie.title}
        </h3>

        <p className="line-clamp-1 text-xs text-text-secondary">
          {[movie.year, movie.genres?.[0]].filter(Boolean).join(" · ") || "—"}
        </p>

        {duration && (
          <p className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
            {movie.media_type === "tv" ? (
              <LayersIcon className="h-3.5 w-3.5 text-accent-secondary/70" />
            ) : (
              <ClockIcon className="h-3.5 w-3.5 text-accent-secondary/70" />
            )}
            {duration}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xs font-bold text-accent-alt">${Number(movie.price_buy).toFixed(2)}</span>
          <span className="text-[11px] text-text-secondary">
            Renta <span className="font-semibold text-accent-tertiary-alt">${Number(movie.price_rent).toFixed(2)}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
