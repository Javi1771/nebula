import Image from "next/image";
import Link from "next/link";
import { PlaceholderArt } from "@/components/PlaceholderArt";
import { StarIcon } from "@/components/StarIcon";
import type { Movie } from "@/lib/types";

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-pop"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        {movie.poster_url ? (
          <Image
            src={movie.poster_url}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <PlaceholderArt className="absolute inset-0 rounded-none" />
        )}
        {movie.imdb_rating && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-dark-surface/80 px-2 py-1 text-xs font-semibold text-on-dark backdrop-blur">
            <StarIcon />
            {movie.imdb_rating}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-1 font-semibold text-text transition-colors group-hover:text-accent">
          {movie.title}
        </h3>
        <p className="line-clamp-2 text-sm text-text-secondary">{movie.plot}</p>

        <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-text-secondary">
          <span>{movie.year ?? "—"}</span>
          {movie.genre && (
            <>
              <span aria-hidden className="h-1 w-1 rounded-full bg-accent-secondary/60" />
              <span>{movie.genre}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
