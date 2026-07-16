export type Role = "user" | "admin";

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: Role;
  balance: string; // numeric comes back as string from postgres.js
  created_at: string;
}

export type PublicUser = Omit<User, "password_hash">;

export interface Movie {
  id: string;
  imdb_id: string;
  title: string;
  year: string | null;
  poster_url: string | null;
  genre: string | null;
  plot: string | null;
  imdb_rating: string | null;
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
