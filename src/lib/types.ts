export type Role = "user" | "admin";

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: Role;
  balance: string; // numeric comes back as string from postgres.js
  avatar_url: string | null;
  created_at: string;
}

export type PublicUser = Omit<User, "password_hash">;

export type MediaType = "movie" | "tv";

export interface Movie {
  id: string;
  tmdb_id: number | null;
  media_type: MediaType;
  title: string;
  year: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  genres: string[] | null;
  overview: string | null;
  vote_average: string | null;
  runtime: number | null;
  number_of_seasons: number | null;
  number_of_episodes: number | null;
  tagline: string | null;
  popularity: string | null;
  trending_day: boolean;
  trending_week: boolean;
  price_buy: string;
  price_rent: string;
  created_at: string;
}

export type PurchaseType = "buy" | "rent";

export interface Purchase {
  id: string;
  user_id: string;
  movie_id: string;
  type: PurchaseType;
  price: string;
  rented_until: string | null;
  created_at: string;
}

export interface SessionPayload {
  userId: string;
  role: Role;
  [key: string]: unknown;
}

export interface GenreCount {
  name: string;
  count: number;
}

export interface Favorite {
  id: string;
  user_id: string;
  movie_id: string;
  created_at: string;
}

/** A TMDB title not yet in our catalog, shown as a non-purchasable "Próximamente" card. */
export interface UpcomingItem {
  tmdbId: number;
  title: string;
  posterUrl: string | null;
  year: string | null;
  voteAverage: number | null;
}
