import "server-only";

const OMDB_BASE_URL = "https://www.omdbapi.com/";

function getApiKey() {
  const key = process.env.OMDB_API_KEY;
  if (!key) throw new Error("OMDB_API_KEY environment variable is not set");
  return key;
}

export interface OmdbSearchResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface OmdbMovieDetail {
  Title: string;
  Year: string;
  Genre: string;
  Plot: string;
  Poster: string;
  imdbRating: string;
  imdbID: string;
  Response: "True" | "False";
  Error?: string;
}

export async function searchOmdb(title: string): Promise<OmdbSearchResult[]> {
  const url = new URL(OMDB_BASE_URL);
  url.searchParams.set("apikey", getApiKey());
  url.searchParams.set("s", title);
  url.searchParams.set("type", "movie");

  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = await res.json();

  if (data.Response === "False") return [];
  return data.Search as OmdbSearchResult[];
}

export async function getOmdbByImdbId(
  imdbId: string
): Promise<OmdbMovieDetail | null> {
  const url = new URL(OMDB_BASE_URL);
  url.searchParams.set("apikey", getApiKey());
  url.searchParams.set("i", imdbId);
  url.searchParams.set("plot", "full");

  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = (await res.json()) as OmdbMovieDetail;

  if (data.Response === "False") return null;
  return data;
}

/** OMDb's Genre field is comma-separated (e.g. "Action, Adventure, Sci-Fi") — keep only the primary one so the DB column stays atomic (3NF). */
export function primaryGenre(genre: string | undefined | null): string | null {
  if (!genre) return null;
  return genre.split(",")[0]?.trim() || null;
}
