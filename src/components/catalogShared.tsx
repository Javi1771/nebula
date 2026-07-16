"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { ChevronRightIcon, FilmIcon, TvIcon } from "@/components/icons";
import { CATALOG_PAGE_SIZE } from "@/lib/constants";
import type { GenreCount, Movie } from "@/lib/types";

export type SortOption = "popular" | "rating" | "recent" | "title";
export type TypeOption = "movie" | "tv" | null;

export const SORT_LABELS: Record<SortOption, string> = {
  popular: "Populares",
  rating: "Mejor calificadas",
  recent: "Más recientes",
  title: "A – Z",
};

interface MoviesResponse {
  items: Movie[];
  total: number;
  hasMore: boolean;
  genres: GenreCount[];
}

export interface CatalogFilters {
  genre: string | null;
  type: TypeOption;
  sort: SortOption;
  search: string;
}

/** Shared fetch/pagination state machine for every screen that lists the catalog. */
export function useCatalog({ genre, type, sort, search }: CatalogFilters) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<GenreCount[]>([]);
  const [total, setTotal] = useState(0);
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
          sort,
        });
        if (genre) params.set("genre", genre);
        if (type) params.set("type", type);
        if (search) params.set("search", search);

        const res = await fetch(`/api/movies?${params.toString()}`);
        if (!res.ok) throw new Error("No se pudo cargar el catálogo");
        const data: MoviesResponse = await res.json();

        setMovies((prev) => (replace ? data.items : [...prev, ...data.items]));
        setGenres(data.genres);
        setTotal(data.total);
        setHasMore(data.hasMore);
        setOffset(nextOffset);
      } catch {
        setError("No se pudo cargar el catálogo. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    },
    [genre, type, search, sort]
  );

  useEffect(() => {
    startTransition(() => {
      fetchMovies(0, true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genre, type, search, sort]);

  return {
    movies,
    genres,
    total,
    hasMore,
    loading,
    error,
    loadMore: () => fetchMovies(offset + CATALOG_PAGE_SIZE, false),
  };
}

/** Fetches the logged-in user's favorite ids once, for painting hearts on cards. */
export function useFavoriteIds(isLoggedIn: boolean) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch("/api/favorites/ids")
      .then((res) => (res.ok ? res.json() : []))
      .then((ids: string[]) => setFavoriteIds(new Set(ids)))
      .catch(() => {});
  }, [isLoggedIn]);

  return favoriteIds;
}

export function TypeSegmented({ value, onChange }: { value: TypeOption; onChange: (v: TypeOption) => void }) {
  const options = [
    { value: null, label: "Todo", icon: null },
    { value: "movie" as const, label: "Películas", icon: <FilmIcon className="h-3.5 w-3.5" /> },
    { value: "tv" as const, label: "Series", icon: <TvIcon className="h-3.5 w-3.5" /> },
  ];
  return (
    <div className="inline-flex shrink-0 rounded-xl border border-border bg-background p-1" role="group" aria-label="Tipo de contenido">
      {options.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all sm:px-3.5 ${
            value === opt.value ? "bg-gradient-nebula text-ink shadow-pop" : "text-text-secondary hover:text-accent-alt"
          }`}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function SortSelect({ value, onChange }: { value: SortOption; onChange: (v: SortOption) => void }) {
  return (
    <label className="relative shrink-0">
      <span className="sr-only">Ordenar por</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="cursor-pointer appearance-none rounded-xl border border-border bg-background py-2.5 pl-3.5 pr-9 text-sm font-medium text-text transition-colors focus:border-accent focus:outline-none"
      >
        {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
          <option key={key} value={key}>
            {SORT_LABELS[key]}
          </option>
        ))}
      </select>
      <ChevronRightIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-text-secondary" />
    </label>
  );
}

export function GenreChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
        active
          ? "bg-gradient-nebula text-ink shadow-pop"
          : "border border-border bg-surface text-text-secondary hover:border-accent hover:text-accent-alt"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`text-[10px] font-bold ${active ? "text-ink/60" : "text-text-secondary/60"}`}>{count}</span>
      )}
    </button>
  );
}

/** Horizontal snap row with desktop prev/next buttons. */
export function ScrollRow({
  children,
  className = "",
  gapClass = "gap-4",
  padBottom = "pb-2",
}: {
  children: React.ReactNode;
  className?: string;
  gapClass?: string;
  padBottom?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByDir(dir: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={trackRef}
        className={`no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto px-4 sm:-mx-6 sm:px-6 ${gapClass} ${padBottom}`}
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => scrollByDir(-1)}
        aria-label="Desplazar a la izquierda"
        className="absolute -left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-text shadow-pop transition-all hover:border-accent hover:text-accent-alt active:scale-90 sm:flex"
      >
        <ChevronRightIcon className="h-4 w-4 rotate-180" />
      </button>
      <button
        type="button"
        onClick={() => scrollByDir(1)}
        aria-label="Desplazar a la derecha"
        className="absolute -right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-text shadow-pop transition-all hover:border-accent hover:text-accent-alt active:scale-90 sm:flex"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="skeleton aspect-[2/3] w-full" />
      <div className="flex flex-col gap-2 p-3.5">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
      </div>
    </div>
  );
}

/** Bento placement: same-size cards, alternating columns nudged down.
 * Pair with BENTO_GRID_GAP so the shifted cards never invade the next row. */
export function bentoOffset(i: number) {
  return i % 2 === 1 ? "sm:translate-y-8" : "";
}

/** Row gap sized to absorb the 2rem bento shift (3.5rem − 2rem = 1.5rem real gap). */
export const BENTO_GRID_GAP = "gap-x-4 gap-y-5 sm:gap-x-5 sm:gap-y-14";
