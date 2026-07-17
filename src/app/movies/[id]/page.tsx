import Image from "next/image";
import { notFound } from "next/navigation";
import { z } from "zod";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { getDetail, getVideos, pickTrailer, posterUrl, profileUrl, titleOf, yearOf } from "@/lib/tmdb";
import { PlaceholderArt } from "@/components/PlaceholderArt";
import { BuyRentButtons } from "@/components/BuyRentButtons";
import { FavoriteButton } from "@/components/FavoriteButton";
import { StarIcon } from "@/components/StarIcon";
import { TrailerModal } from "@/components/TrailerModal";
import { CalendarIcon, TvIcon, FilmIcon, QuoteIcon, LayersIcon, ImageOffIcon } from "@/components/icons";
import { BackButton } from "@/components/BackButton";
import { ScrollRow } from "@/components/catalogShared";
import { slugify } from "@/lib/slug";
import type { Movie, Purchase } from "@/lib/types";

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

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

  let isFavorite = false;
  if (user) {
    const [favorite] = await sql<{ id: string }[]>`
      select id from favorites where user_id = ${user.id} and movie_id = ${movie.id}
    `;
    isFavorite = Boolean(favorite);
  }

  const detail = movie.tmdb_id
    ? await getDetail(movie.media_type, movie.tmdb_id).catch(() => null)
    : null;

  let trailer = detail ? pickTrailer(detail.videos?.results) : null;
  if (!trailer && movie.tmdb_id) {
    // Spanish-dubbed trailers are the exception on TMDB — fall back to English so the button isn't hidden for most titles.
    trailer = await getVideos(movie.media_type, movie.tmdb_id)
      .then(pickTrailer)
      .catch(() => null);
  }

  const cast = detail?.credits?.cast?.slice(0, 10) ?? [];
  const reviews = detail?.reviews?.results?.slice(0, 4) ?? [];
  const recItems = detail?.recommendations?.results?.slice(0, 8) ?? [];
  const recIds = recItems.map((r) => r.id);

  const catalogMatches = recIds.length
    ? await sql<Pick<Movie, "id" | "tmdb_id">[]>`
        select id, tmdb_id from movies
        where media_type = ${movie.media_type} and tmdb_id = any(${sql.array(recIds)}::int[])
      `
    : [];
  const catalogByTmdbId = new Map(catalogMatches.map((m) => [m.tmdb_id, m.id]));

  const runtime =
    detail?.runtime ??
    (detail?.episode_run_time?.length ? detail.episode_run_time[0] : undefined);

  return (
    <div className="animate-fade-up lg:px-6 lg:pt-6">
      <section className="relative overflow-hidden border-b border-white/10 bg-dark-surface text-on-dark lg:rounded-3xl lg:border lg:shadow-pop">
        {movie.backdrop_url && (
          <div className="absolute inset-0">
            <Image src={movie.backdrop_url} alt="" fill sizes="100vw" className="object-cover opacity-60" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-dark-surface/55 to-dark-surface/15" />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-surface via-dark-surface/35 to-transparent" />
          </div>
        )}

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
          <BackButton fallback="/" label="Volver al catálogo" tone="dark" className="mb-8" />
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] lg:gap-12">
            <div className="mx-auto w-48 shrink-0 sm:mx-0 sm:w-full">
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl shadow-pop ring-1 ring-white/10">
                {movie.poster_url ? (
                  <Image src={movie.poster_url} alt={movie.title} fill sizes="280px" className="object-cover" priority />
                ) : (
                  <PlaceholderArt className="absolute inset-0 rounded-none" />
                )}
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                {movie.media_type === "tv" ? <TvIcon /> : <FilmIcon />}
                {movie.media_type === "tv" ? "Serie" : "Película"}
              </span>

              <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{movie.title}</h1>

              {detail?.tagline && <p className="mt-3 italic text-on-dark-soft">“{detail.tagline}”</p>}

              {movie.genres && movie.genres.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {movie.genres.map((g) => (
                    <Link
                      key={g}
                      href={`/search?genre=${slugify(g)}`}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-on-dark-soft transition-colors hover:border-accent/60 hover:text-accent"
                    >
                      {g}
                    </Link>
                  ))}
                </div>
              )}

              {/* Ficha técnica en tiles de vidrio */}
              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                <HeroStat icon={<CalendarIcon className="h-4 w-4" />} label="Año" value={movie.year ?? "—"} />
                {runtime ? (
                  <HeroStat
                    icon={<FilmIcon className="h-4 w-4" />}
                    label={movie.media_type === "tv" ? "Duración por cap." : "Duración"}
                    value={movie.media_type === "tv" ? `${runtime} min` : `${Math.floor(runtime / 60)}h ${runtime % 60}m`}
                  />
                ) : null}
                {detail?.number_of_seasons ? (
                  <HeroStat
                    icon={<LayersIcon className="h-4 w-4" />}
                    label="Temporadas"
                    value={String(detail.number_of_seasons)}
                  />
                ) : null}
                {detail?.number_of_episodes ? (
                  <HeroStat
                    icon={<TvIcon className="h-4 w-4" />}
                    label="Episodios"
                    value={String(detail.number_of_episodes)}
                  />
                ) : null}
                {movie.vote_average ? (
                  <HeroStat
                    icon={<StarIcon className="h-4 w-4 text-accent" />}
                    label="Calificación TMDB"
                    value={`${movie.vote_average} / 10`}
                  />
                ) : null}
              </div>

              <p className="mt-5 max-w-3xl leading-relaxed text-on-dark-soft">{movie.overview}</p>

              {/* Los precios viven en los propios botones de compra/renta — sin tarjetas duplicadas. */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
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
                {trailer && <TrailerModal videoKey={trailer.key} title={movie.title} />}
                <FavoriteButton
                  movieId={movie.id}
                  isLoggedIn={Boolean(user)}
                  initialFavorited={isFavorite}
                  size="md"
                  className="border border-white/15"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
        {cast.length > 0 && (
          <section>
            <SectionTitle>Reparto</SectionTitle>
            <ScrollRow className="mt-5" gapClass="gap-4" padBottom="pb-2" autoScroll>
              {cast.map((member) => (
                <div
                  key={member.id}
                  className="w-32 shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-pop"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-surface-elevated">
                    {member.profile_path ? (
                      <Image src={profileUrl(member.profile_path) ?? ""} alt={member.name} fill sizes="128px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-text-secondary/50">
                        <ImageOffIcon className="h-7 w-7" />
                        <span className="text-[9px] font-medium uppercase tracking-wide">Sin foto</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-1 text-xs font-semibold text-text">{member.name}</p>
                    <p className="line-clamp-1 text-[11px] text-text-secondary">{member.character}</p>
                  </div>
                </div>
              ))}
            </ScrollRow>
          </section>
        )}

        {reviews.length > 0 && (
          <section className="mt-14">
            <SectionTitle>Reseñas</SectionTitle>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-border bg-surface p-5 shadow-card">
                  <QuoteIcon className="h-5 w-5 text-accent/50" />
                  <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-text-secondary">{review.content}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-text">{review.author}</p>
                    {review.author_details.rating && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-tertiary-alt">
                        <StarIcon className="h-3 w-3 text-accent-tertiary" />
                        {review.author_details.rating}/10
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {recItems.length > 0 && (
          <section className="mt-14">
            <SectionTitle>También te puede interesar</SectionTitle>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {recItems.map((rec) => {
                const catalogId = catalogByTmdbId.get(rec.id);
                const poster = posterUrl(rec.poster_path);
                const content = (
                  <>
                    <div className="relative aspect-[2/3] w-full overflow-hidden">
                      {poster ? (
                        <Image
                          src={poster}
                          alt={titleOf(rec)}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className={`object-cover transition-transform duration-500 ${catalogId ? "group-hover:scale-105" : "grayscale opacity-70"}`}
                        />
                      ) : (
                        <PlaceholderArt className="absolute inset-0 rounded-none" />
                      )}
                      {!catalogId && (
                        <span className="absolute inset-x-0 bottom-0 bg-dark-surface/85 px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-on-dark">
                          Aún no en el catálogo
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-1 text-sm font-semibold text-text">{titleOf(rec)}</p>
                      <p className="text-xs text-text-secondary">{yearOf(rec) ?? "—"}</p>
                    </div>
                  </>
                );

                return catalogId ? (
                  <Link
                    key={rec.id}
                    href={`/movies/${catalogId}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-pop"
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    key={rec.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface opacity-80 shadow-card"
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function HeroStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-accent">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-medium uppercase tracking-wide text-on-dark-soft">{label}</span>
        <span className="block truncate text-sm font-bold text-white">{value}</span>
      </span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 text-lg font-bold tracking-tight text-text sm:text-xl">
      <span aria-hidden className="h-6 w-1 rounded-full bg-gradient-nebula" />
      {children}
    </h2>
  );
}
