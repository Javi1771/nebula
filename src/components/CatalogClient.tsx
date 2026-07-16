"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MovieCard, formatDuration } from "@/components/MovieCard";
import { StarIcon } from "@/components/StarIcon";
import { PlaceholderArt } from "@/components/PlaceholderArt";
import {
  ChevronRightIcon,
  FilmIcon,
  FlameIcon,
  PlayIcon,
  SearchIcon,
  TrendingUpIcon,
  TvIcon,
} from "@/components/icons";
import {
  BENTO_GRID_GAP,
  CardSkeleton,
  ScrollRow,
  SortSelect,
  TypeSegmented,
  bentoOffset,
  useCatalog,
  useFavoriteIds,
  type SortOption,
  type TypeOption,
} from "@/components/catalogShared";
import type { GenreCount, Movie } from "@/lib/types";

interface CatalogClientProps {
  isLoggedIn?: boolean;
  trendingDay?: Movie[];
  trendingWeek?: Movie[];
  genreCounts?: GenreCount[];
}

export function CatalogClient({
  isLoggedIn = false,
  trendingDay = [],
  trendingWeek = [],
  genreCounts = [],
}: CatalogClientProps) {
  const [type, setType] = useState<TypeOption>(null);
  const [sort, setSort] = useState<SortOption>("popular");
  const catalogRef = useRef<HTMLDivElement>(null);

  const { movies, total, hasMore, loading, error, loadMore } = useCatalog({
    genre: null,
    type,
    sort,
    search: "",
  });
  const favoriteIds = useFavoriteIds(isLoggedIn);

  const initialLoading = loading && movies.length === 0;
  const [spotlight, ...restTrending] = trendingDay;

  return (
    <div className="flex flex-col gap-12 lg:gap-16">
      <HeroCarousel
        items={trendingDay.filter((m) => m.backdrop_url).slice(0, 5)}
        onExplore={() => catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
      />

      {/* ---------- Tendencias de hoy ---------- */}
      {trendingDay.length > 0 && (
        <section aria-label="Tendencias de hoy">
          <SectionHeading
            icon={<FlameIcon className="h-5 w-5" />}
            title="Tendencias de hoy"
            subtitle="Lo más visto en este momento, actualizado desde TMDB"
          />

          {spotlight && <TrendingSpotlight movie={spotlight} />}

          <ScrollRow className="mt-6" gapClass="gap-5" padBottom="pb-4">
            {restTrending.map((movie, i) => (
              <RankedCard key={movie.id} movie={movie} rank={i + 2} />
            ))}
          </ScrollRow>
        </section>
      )}

      {/* ---------- Tendencias de la semana ---------- */}
      {trendingWeek.length > 0 && (
        <section aria-label="Tendencias de la semana">
          <SectionHeading
            icon={<TrendingUpIcon className="h-5 w-5" />}
            title="Tendencias de la semana"
            subtitle="Los títulos que dominaron los últimos 7 días"
          />
          <ScrollRow className="mt-5" gapClass="gap-4" padBottom="pb-2">
            {trendingWeek.map((movie) => (
              <MiniCard key={movie.id} movie={movie} />
            ))}
          </ScrollRow>
        </section>
      )}

      {/* ---------- Explora por género ---------- */}
      {genreCounts.length > 0 && (
        <section aria-label="Explora por género">
          <SectionHeading
            icon={<FilmIcon className="h-5 w-5" />}
            title="Explora por género"
            subtitle="Elige un mundo y sumérgete"
          />
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-6">
            {genreCounts.slice(0, 11).map((g, i) => (
              <GenreCard key={g.name} genre={g} index={i} />
            ))}
            <Link
              href="/search"
              className="group flex min-h-[96px] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-border text-text-secondary transition-all hover:border-accent hover:text-accent-alt"
            >
              <SearchIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span className="text-sm font-semibold">Ver todos</span>
            </Link>
          </div>
        </section>
      )}

      {/* ---------- Populares del catálogo ---------- */}
      <section ref={catalogRef} className="scroll-mt-6" aria-label="Catálogo">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-text sm:text-2xl">Explora el catálogo</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {total > 0 ? `${total} título${total === 1 ? "" : "s"} disponibles` : "Películas y series para comprar o rentar"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <TypeSegmented value={type} onChange={setType} />
            <SortSelect value={sort} onChange={setSort} />
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm font-semibold text-accent-alt shadow-card transition-all hover:border-accent hover:shadow-pop"
            >
              <SearchIcon className="h-4 w-4" />
              Búsqueda avanzada
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        {/* Bento grid: cards del mismo tamaño, columnas alternas desplazadas hacia abajo. */}
        <div className={`mt-6 grid grid-cols-2 pb-14 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 ${BENTO_GRID_GAP}`}>
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
      </section>
    </div>
  );
}

/** Slim gradient edge + inline icon — intentionally subtle so the content leads. */
function SectionHeading({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden className="h-10 w-1 shrink-0 rounded-full bg-gradient-nebula" />
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-text sm:text-xl">
          <span className="text-accent-alt [&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</span>
          {title}
        </h2>
        <p className="text-xs text-text-secondary sm:text-sm">{subtitle}</p>
      </div>
    </div>
  );
}


/* ---------- Hero destacado con rotación ---------- */

function HeroCarousel({ items, onExplore }: { items: Movie[]; onExplore: () => void }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const handle = setInterval(() => setIndex((i) => (i + 1) % items.length), 7000);
    return () => clearInterval(handle);
  }, [items.length]);

  if (items.length === 0) {
    return (
      <section className="relative overflow-hidden rounded-3xl bg-dark-surface px-6 py-16 text-on-dark sm:px-10">
        <div
          aria-hidden
          className="animate-orbit-glow pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
          style={{ background: "linear-gradient(135deg, #1ebe91, #41cff0)" }}
        />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Catálogo Nébula</span>
        <h1 className="mt-3 max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
          Compra o renta tus <span className="text-gradient-nebula">películas y series favoritas</span>
        </h1>
      </section>
    );
  }

  const current = items[index];
  const duration = formatDuration(current);

  return (
    <section className="relative min-h-[420px] overflow-hidden rounded-3xl bg-dark-surface text-on-dark shadow-pop sm:min-h-[480px]">
      {items.map((item, i) => (
        <div
          key={item.id}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"}`}
        >
          {item.backdrop_url && (
            <Image
              src={item.backdrop_url}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 80vw"
              className="object-cover object-top"
              priority={i === 0}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-dark-surface/70 to-dark-surface/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-surface/95 via-dark-surface/50 to-transparent" />
        </div>
      ))}

      <div className="relative flex min-h-[420px] flex-col justify-end p-6 sm:min-h-[480px] sm:p-10">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-nebula px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink shadow-pop">
          <FlameIcon className="h-3.5 w-3.5" />
          Tendencia #{index + 1} de hoy
        </span>

        <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{current.title}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-on-dark-soft">
          <span className="inline-flex items-center gap-1.5 font-semibold text-white">
            {current.media_type === "tv" ? <TvIcon className="h-4 w-4" /> : <FilmIcon className="h-4 w-4" />}
            {current.media_type === "tv" ? "Serie" : "Película"}
          </span>
          {current.year && <span>· {current.year}</span>}
          {duration && <span>· {duration}</span>}
          {current.vote_average && (
            <span className="inline-flex items-center gap-1 font-semibold text-white">
              · <StarIcon className="h-3.5 w-3.5 text-accent" /> {current.vote_average}
            </span>
          )}
        </div>

        {current.overview && (
          <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-relaxed text-on-dark-soft sm:line-clamp-3">
            {current.overview}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/movies/${current.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-nebula px-6 py-2.5 text-sm font-semibold text-ink shadow-pop transition-transform hover:scale-[1.03] active:scale-95"
          >
            <PlayIcon className="h-4 w-4" />
            Ver detalles
          </Link>
          <button
            type="button"
            onClick={onExplore}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/20 active:scale-95"
          >
            Explorar catálogo
          </button>
        </div>

        {items.length > 1 && (
          <div className="mt-6 flex items-center gap-2">
            {items.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setIndex(i)}
                aria-label={`Ver ${item.title}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === index ? "w-8 bg-gradient-nebula" : "w-3 bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- Tendencia #1: tarjeta spotlight a lo ancho ---------- */

function TrendingSpotlight({ movie }: { movie: Movie }) {
  const duration = formatDuration(movie);

  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group relative mt-6 block overflow-hidden rounded-3xl border border-border bg-dark-surface text-on-dark shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-pop"
    >
      {movie.backdrop_url && (
        <Image
          src={movie.backdrop_url}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 70vw"
          className="object-cover opacity-45 transition-transform duration-700 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-dark-surface via-dark-surface/70 to-dark-surface/20" />

      <div className="relative flex items-center gap-5 p-5 sm:gap-8 sm:p-8">
        <span
          aria-hidden
          className="select-none bg-gradient-nebula bg-clip-text text-7xl font-black leading-none tracking-tighter text-transparent sm:text-9xl"
        >
          1
        </span>

        <div className="relative hidden w-28 shrink-0 overflow-hidden rounded-xl shadow-pop sm:block sm:w-32">
          <div className="relative aspect-[2/3]">
            {movie.poster_url ? (
              <Image src={movie.poster_url} alt={movie.title} fill sizes="128px" className="object-cover" />
            ) : (
              <PlaceholderArt className="absolute inset-0 rounded-none" />
            )}
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-accent">Lo más visto hoy</p>
          <h3 className="mt-1 line-clamp-1 text-xl font-bold tracking-tight sm:text-3xl">{movie.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-dark-soft sm:text-sm">
            <span>{movie.media_type === "tv" ? "Serie" : "Película"}</span>
            {movie.year && <span>· {movie.year}</span>}
            {duration && <span>· {duration}</span>}
            {movie.vote_average && (
              <span className="inline-flex items-center gap-1 font-semibold text-white">
                · <StarIcon className="h-3 w-3 text-accent" /> {movie.vote_average}
              </span>
            )}
          </div>
          {movie.overview && (
            <p className="mt-2 line-clamp-2 max-w-xl text-xs leading-relaxed text-on-dark-soft sm:text-sm">
              {movie.overview}
            </p>
          )}
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
            Ver detalles
            <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ---------- Card con ranking (tendencias de hoy #2+) ---------- */

function RankedCard({ movie, rank }: { movie: Movie; rank: number }) {
  return (
    <Link href={`/movies/${movie.id}`} className="group relative block shrink-0 snap-start pb-4 pr-5">
      {/* El número queda casi todo detrás de la card: solo asoma una orilla abajo a la derecha. */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 select-none bg-gradient-nebula bg-clip-text text-6xl font-black leading-[0.8] tracking-tighter text-transparent opacity-70 transition-opacity group-hover:opacity-100 sm:text-[88px]"
      >
        {rank}
      </span>
      <span className="relative z-10 block w-32 overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-pop sm:w-40">
        <span className="relative block aspect-[2/3]">
          {movie.poster_url ? (
            <Image
              src={movie.poster_url}
              alt={movie.title}
              fill
              sizes="160px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <PlaceholderArt className="absolute inset-0 rounded-none" />
          )}
          <span className="absolute left-1.5 top-1.5 rounded-full bg-dark-surface/85 px-2 py-0.5 text-[10px] font-bold uppercase text-on-dark backdrop-blur">
            {movie.media_type === "tv" ? "Serie" : "Película"}
          </span>
          {movie.vote_average && (
            <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded-full bg-dark-surface/85 px-1.5 py-0.5 text-[10px] font-bold text-on-dark backdrop-blur">
              <StarIcon className="h-2.5 w-2.5 text-accent" />
              {movie.vote_average}
            </span>
          )}
        </span>
        <span className="block p-2.5">
          <span className="block truncate text-xs font-semibold text-text">{movie.title}</span>
          <span className="mt-0.5 block truncate text-[11px] text-text-secondary">
            {[movie.year, formatDuration(movie)].filter(Boolean).join(" · ")}
          </span>
        </span>
      </span>
    </Link>
  );
}

/* ---------- Card compacta (tendencias de la semana) ---------- */

function MiniCard({ movie }: { movie: Movie }) {
  return (
    <Link key={movie.id} href={`/movies/${movie.id}`} className="group relative shrink-0 snap-start">
      <span className="relative block w-32 overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-pop sm:w-36">
        <span className="relative block aspect-[2/3]">
          {movie.poster_url ? (
            <Image
              src={movie.poster_url}
              alt={movie.title}
              fill
              sizes="144px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <PlaceholderArt className="absolute inset-0 rounded-none" />
          )}
          {movie.vote_average && (
            <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded-full bg-dark-surface/85 px-1.5 py-0.5 text-[10px] font-bold text-on-dark backdrop-blur">
              <StarIcon className="h-2.5 w-2.5 text-accent" />
              {movie.vote_average}
            </span>
          )}
        </span>
        <span className="block p-2.5">
          <span className="block truncate text-xs font-semibold text-text">{movie.title}</span>
          <span className="mt-0.5 block text-[11px] text-text-secondary">
            {[movie.year, movie.media_type === "tv" ? "Serie" : "Película"].filter(Boolean).join(" · ")}
          </span>
        </span>
      </span>
    </Link>
  );
}

/* ---------- Cards de género ---------- */

const GENRE_GRADIENTS = [
  "linear-gradient(135deg, #005546 0%, #1ebe91 100%)",
  "linear-gradient(135deg, #005073 0%, #41cff0 100%)",
  "linear-gradient(135deg, #0f2d3c 0%, #4ba591 100%)",
  "linear-gradient(135deg, #005073 0%, #3cdcf0 100%)",
  "linear-gradient(135deg, #0f2d3c 0%, #1ebe91 100%)",
  "linear-gradient(135deg, #005546 0%, #69d7b9 100%)",
];

function GenreCard({ genre, index }: { genre: GenreCount; index: number }) {
  return (
    <Link
      href={`/search?genre=${encodeURIComponent(genre.name)}`}
      className="group relative flex min-h-[96px] flex-col justify-end overflow-hidden rounded-2xl p-4 text-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-pop"
      style={{ background: GENRE_GRADIENTS[index % GENRE_GRADIENTS.length] }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-2 -top-6 select-none text-[88px] font-black leading-none text-white/10 transition-transform duration-500 group-hover:scale-110"
      >
        {genre.name.slice(0, 1)}
      </span>
      <span className="relative text-sm font-bold leading-tight sm:text-base">{genre.name}</span>
      <span className="relative mt-0.5 text-[11px] font-medium text-white/70">
        {genre.count} título{genre.count === 1 ? "" : "s"}
      </span>
    </Link>
  );
}
