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
      title text not null,
      price_buy numeric(10, 2) not null,
      price_rent numeric(10, 2) not null,
      created_at timestamptz not null default now()
    )
  `;

  // Migrate from the OMDb-shaped schema to TMDB: drop the imdb_id-era columns,
  // add the fields TMDB gives us, and key uniqueness off (tmdb_id, media_type)
  // since a movie and a tv show can share the same numeric id.
  await sql`alter table movies drop constraint if exists movies_imdb_id_key`;
  await sql`drop index if exists movies_genre_idx`;
  await sql`alter table movies drop column if exists imdb_id`;
  await sql`alter table movies drop column if exists genre`;
  await sql`alter table movies drop column if exists plot`;
  await sql`alter table movies drop column if exists imdb_rating`;

  await sql`alter table movies add column if not exists tmdb_id integer`;
  await sql`alter table movies add column if not exists media_type text not null default 'movie'`;
  await sql`alter table movies add column if not exists year text`;
  await sql`alter table movies add column if not exists poster_url text`;
  await sql`alter table movies add column if not exists backdrop_url text`;
  await sql`alter table movies add column if not exists genres text[]`;
  await sql`alter table movies add column if not exists overview text`;
  await sql`alter table movies add column if not exists vote_average numeric(3, 1)`;

  // Detail fields hydrated from each title's TMDB detail endpoint at import time,
  // plus trending flags refreshed by the seed from /trending/{movie,tv}/{day,week}.
  await sql`alter table movies add column if not exists runtime integer`;
  await sql`alter table movies add column if not exists number_of_seasons integer`;
  await sql`alter table movies add column if not exists number_of_episodes integer`;
  await sql`alter table movies add column if not exists tagline text`;
  await sql`alter table movies add column if not exists popularity numeric(10, 2)`;
  await sql`alter table movies add column if not exists trending_day boolean not null default false`;
  await sql`alter table movies add column if not exists trending_week boolean not null default false`;

  await sql`alter table movies drop constraint if exists movies_media_type_check`;
  await sql`alter table movies add constraint movies_media_type_check check (media_type in ('movie', 'tv'))`;

  await sql`
    create unique index if not exists movies_tmdb_id_media_type_idx
    on movies(tmdb_id, media_type) where tmdb_id is not null
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
  await sql`create index if not exists movies_genres_idx on movies using gin (genres)`;
  await sql`create index if not exists movies_media_type_idx on movies(media_type)`;

  await sql`alter table users add column if not exists avatar_url text`;

  await sql`
    create table if not exists favorites (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      movie_id uuid not null references movies(id) on delete cascade,
      created_at timestamptz not null default now(),
      unique (user_id, movie_id)
    )
  `;
  await sql`create index if not exists favorites_user_id_idx on favorites(user_id)`;

  console.log("Migration complete.");
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
