"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { MovieCard } from "@/components/MovieCard";
import { CATALOG_PAGE_SIZE } from "@/lib/constants";
import type { Movie } from "@/lib/types";

interface MoviesResponse {
  items: Movie[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
  genres: string[];
}

export function CatalogClient() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [genre, setGenre] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = useCallback(
    async (nextOffset: number, replace: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          offset: String(nextOffset),
          limit: String(CATALOG_PAGE_SIZE),
        });
        if (genre) params.set("genre", genre);
        if (search) params.set("search", search);

        const res = await fetch(`/api/movies?${params.toString()}`);
        if (!res.ok) throw new Error("No se pudo cargar el catálogo");
        const data: MoviesResponse = await res.json();

        setMovies((prev) => (replace ? data.items : [...prev, ...data.items]));
        setGenres(data.genres);
        setHasMore(data.hasMore);
        setOffset(nextOffset);
      } catch {
        setError("No se pudo cargar el catálogo. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    },
    [genre, search]
  );

  useEffect(() => {
    startTransition(() => {
      fetchMovies(0, true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genre, search]);

  const initialLoading = loading && movies.length === 0;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setGenre(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              genre === null
                ? "bg-gradient-nebula text-white shadow-pop"
                : "border border-border text-text-secondary hover:border-accent hover:text-accent"
            }`}
          >
            Todas
          </button>
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                genre === g
                  ? "bg-gradient-nebula text-white shadow-pop"
                  : "border border-border text-text-secondary hover:border-accent hover:text-accent"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título..."
            className="w-full rounded-full border border-border bg-surface py-2 pl-9 pr-4 text-sm text-text placeholder:text-text-secondary/60 transition-colors focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {movies.length === 0 && !loading && !error && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="font-medium text-text">No se encontraron películas</p>
          <p className="text-sm text-text-secondary">Prueba con otro título o quita los filtros de género.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {initialLoading
          ? Array.from({ length: CATALOG_PAGE_SIZE }).map((_, i) => <CardSkeleton key={i} />)
          : movies.map((movie, i) => (
              <div key={movie.id} className="animate-fade-up" style={{ animationDelay: `${(i % 8) * 40}ms` }}>
                <MovieCard movie={movie} />
              </div>
            ))}
      </div>

      <div className="mt-8 flex justify-center">
        {hasMore && (
          <button
            onClick={() => fetchMovies(offset + CATALOG_PAGE_SIZE, false)}
            disabled={loading}
            className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-text transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Cargar más"}
          </button>
        )}
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="skeleton aspect-[2/3] w-full" />
      <div className="flex flex-col gap-2 p-4">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="m14 14 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
