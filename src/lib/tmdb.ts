import "server-only";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export type MediaType = "movie" | "tv";

function authHeaders() {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!token) throw new Error("TMDB_READ_ACCESS_TOKEN environment variable is not set");
  return { Authorization: `Bearer ${token}`, Accept: "application/json" };
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
  language = "es-MX"
): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set("language", language);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  const res = await fetch(url.toString(), { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`TMDB request failed (${res.status}): ${path}`);
  return res.json() as Promise<T>;
}

export function posterUrl(path: string | null, size: "w185" | "w342" | "w500" | "original" = "w500") {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;
}

export function backdropUrl(path: string | null, size: "w780" | "w1280" | "original" = "w1280") {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;
}

export function profileUrl(path: string | null, size: "w185" | "h632" = "w185") {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;
}

export interface TmdbSearchItem {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  overview?: string;
  vote_average?: number;
}

/** Admin search box: movies + tv shows in one query, people filtered out. */
export async function searchMulti(query: string): Promise<TmdbSearchItem[]> {
  const data = await tmdbFetch<{ results: TmdbSearchItem[] }>("/search/multi", {
    query,
    include_adult: false,
  });
  return data.results.filter((r) => r.media_type === "movie" || r.media_type === "tv");
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export async function getGenres(mediaType: MediaType): Promise<TmdbGenre[]> {
  const data = await tmdbFetch<{ genres: TmdbGenre[] }>(`/genre/${mediaType}/list`);
  return data.genres;
}

export interface TmdbVideo {
  id: string;
  key: string;
  site: string;
  type: string;
  name: string;
  official: boolean;
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface TmdbReview {
  id: string;
  author: string;
  content: string;
  created_at: string;
  author_details: { rating: number | null };
}

export interface TmdbDetail extends TmdbSearchItem {
  backdrop_path: string | null;
  genres: TmdbGenre[];
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  popularity?: number;
  tagline?: string;
  videos: { results: TmdbVideo[] };
  credits: { cast: TmdbCastMember[] };
  reviews: { results: TmdbReview[] };
  recommendations: { results: TmdbSearchItem[] };
}

/** One call gets the detail plus trailers, cast, reviews and "more like this" via append_to_response. */
export async function getDetail(mediaType: MediaType, id: number | string): Promise<TmdbDetail> {
  return tmdbFetch<TmdbDetail>(`/${mediaType}/${id}`, {
    append_to_response: "videos,credits,reviews,recommendations",
  });
}

export async function getPopular(mediaType: MediaType, page = 1): Promise<TmdbSearchItem[]> {
  const data = await tmdbFetch<{ results: TmdbSearchItem[] }>(`/${mediaType}/popular`, { page });
  return data.results;
}

/** Spanish-dubbed trailers are the exception, not the rule, on TMDB — used as a fallback when the es-MX detail call comes back with no videos. */
export async function getVideos(mediaType: MediaType, id: number | string): Promise<TmdbVideo[]> {
  const data = await tmdbFetch<{ results: TmdbVideo[] }>(`/${mediaType}/${id}/videos`, {}, "en-US");
  return data.results;
}

export function pickTrailer(videos: TmdbVideo[] | undefined): TmdbVideo | null {
  if (!videos?.length) return null;
  return (
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ??
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
    videos.find((v) => v.site === "YouTube") ??
    null
  );
}

export function titleOf(item: Pick<TmdbSearchItem, "title" | "name">) {
  return item.title ?? item.name ?? "Sin título";
}

export function yearOf(item: Pick<TmdbSearchItem, "release_date" | "first_air_date">) {
  const date = item.release_date ?? item.first_air_date;
  return date ? date.slice(0, 4) : null;
}
