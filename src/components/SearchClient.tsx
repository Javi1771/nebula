"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MovieCard } from "@/components/MovieCard";
import { SearchIcon } from "@/components/icons";
import { slugify } from "@/lib/slug";
import {
  BENTO_GRID_GAP,
  CardSkeleton,
  GenreChip,
  SortSelect,
  TypeSegmented,
  bentoOffset,
  useCatalog,
  useFavoriteIds,
  type SortOption,
  type TypeOption,
} from "@/components/catalogShared";

/**
 * Full search experience: big query input plus every filter, with genres as a
 * wrapping chip cloud (the home screen only offers genre cards — precision lives here).
 */
export function SearchClient({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();

  const [searchInput, setSearchInput] = useState(params.get("q") ?? "");
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [genre, setGenre] = useState<string | null>(params.get("genre"));
  const [type, setType] = useState<TypeOption>(
    params.get("type") === "movie" || params.get("type") === "tv" ? (params.get("type") as TypeOption) : null
  );
  const [sort, setSort] = useState<SortOption>("popular");

  // Debounce typing → query.
  useEffect(() => {
    const handle = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  // Keep the URL shareable without triggering navigations.
  useEffect(() => {
    const next = new URLSearchParams();
    if (search) next.set("q", search);
    if (genre) next.set("genre", slugify(genre));
    if (type) next.set("type", type);
    const qs = next.toString();
    window.history.replaceState(null, "", qs ? `/search?${qs}` : "/search");
  }, [search, genre, type]);

  const { movies, genres, total, hasMore, loading, error, loadMore } = useCatalog({ genre, type, sort, search });
  const favoriteIds = useFavoriteIds(isLoggedIn);

  const initialLoading = loading && movies.length === 0;
  const hasActiveFilters = Boolean(genre || type || search);

  return (
    <div className="flex flex-col gap-6">
      {/* Buscador principal */}
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
        <input
          type="search"
          autoFocus
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Busca películas y series por título..."
          className="w-full rounded-2xl border border-border bg-surface py-4 pl-12 pr-5 text-base text-text shadow-card placeholder:text-text-secondary/60 transition-all focus:border-accent focus:shadow-pop focus:outline-none"
        />
      </div>

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3">
        <TypeSegmented value={type} onChange={setType} />
        <SortSelect value={sort} onChange={setSort} />
        {hasActiveFilters && (
          <button
            onClick={() => {
              setGenre(null);
              setType(null);
              setSearchInput("");
              setSort("popular");
              router.replace("/search");
            }}
            className="rounded-xl border border-border px-3.5 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:border-accent-secondary hover:text-accent-secondary-alt"
          >
            Limpiar filtros
          </button>
        )}
        <span className="ml-auto text-sm text-text-secondary">
          {loading ? "Buscando..." : `${total} resultado${total === 1 ? "" : "s"}`}
        </span>
      </div>

      {/* Géneros: nube de chips con wrap — aquí sí hay espacio vertical para todos. */}
      {genres.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-surface p-4 shadow-card">
          <GenreChip label="Todos" active={genre === null} onClick={() => setGenre(null)} />
          {genres.map((g) => (
            <GenreChip
              key={g.name}
              label={g.name}
              count={g.count}
              active={genre !== null && slugify(genre) === slugify(g.name)}
              onClick={() => setGenre(genre !== null && slugify(genre) === slugify(g.name) ? null : g.name)}
            />
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {movies.length === 0 && !loading && !error && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
          <SearchIcon className="h-8 w-8 text-text-secondary/50" />
          <p className="font-medium text-text">No se encontraron títulos</p>
          <p className="text-sm text-text-secondary">Prueba con otro título o quita los filtros.</p>
        </div>
      )}

      <div className={`grid grid-cols-2 pb-14 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 ${BENTO_GRID_GAP}`}>
        {initialLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={bentoOffset(i)}>
                <CardSkeleton />
              </div>
            ))
          : movies.map((movie, i) => (
              <div
                key={movie.id}
                className={`animate-fade-up ${bentoOffset(i)}`}
                style={{ animationDelay: `${(i % 10) * 40}ms` }}
              >
                <MovieCard movie={movie} isLoggedIn={isLoggedIn} isFavorite={favoriteIds.has(movie.id)} />
              </div>
            ))}
      </div>

      <div className="flex justify-center">
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-full border border-border bg-surface px-8 py-3 text-sm font-semibold text-text shadow-card transition-all hover:border-accent hover:text-accent-alt hover:shadow-pop disabled:opacity-50"
          >
            {loading ? "Cargando..." : `Cargar más títulos (${total - movies.length} restantes)`}
          </button>
        )}
      </div>
    </div>
  );
}
