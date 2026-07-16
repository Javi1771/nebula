import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import postgres from "postgres";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const sql = postgres(connectionString, { ssl: "require" });

  console.log("Running migration...");

  await sql`create extension if not exists pgcrypto`;

  await sql`
    create table if not exists users (
      id uuid primary key default gen_random_uuid(),
      email text unique not null,
      password_hash text not null,
      name text not null,
      role text not null default 'user' check (role in ('user', 'admin')),
      balance numeric(10, 2) not null default 100.00,
      created_at timestamptz not null default now()
    )
  `;

  await sql`
    create table if not exists movies (
      id uuid primary key default gen_random_uuid(),
      imdb_id text unique not null,
      title text not null,
      year text,
      poster_url text,
      genre text,
      plot text,
      imdb_rating text,
      price_buy numeric(10, 2) not null,
      price_rent numeric(10, 2) not null,
      created_at timestamptz not null default now()
    )
  `;

  await sql`
    create table if not exists purchases (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      movie_id uuid not null references movies(id) on delete cascade,
      type text not null check (type in ('buy', 'rent')),
      price numeric(10, 2) not null,
      rented_until timestamptz,
      created_at timestamptz not null default now()
    )
  `;

  await sql`create index if not exists purchases_user_id_idx on purchases(user_id)`;
  await sql`create index if not exists purchases_movie_id_idx on purchases(movie_id)`;
  await sql`create index if not exists movies_genre_idx on movies(genre)`;

  console.log("Migration complete.");
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
