import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import postgres from "postgres";
import bcrypt from "bcryptjs";

const OMDB_BASE_URL = "https://www.omdbapi.com/";

const DEMO_IMDB_IDS = [
  "tt0111161", // The Shawshank Redemption
  "tt0068646", // The Godfather
  "tt0468569", // The Dark Knight
  "tt0110912", // Pulp Fiction
  "tt0137523", // Fight Club
  "tt1375666", // Inception
  "tt0109830", // Forrest Gump
  "tt0133093", // The Matrix
  "tt0080684", // The Empire Strikes Back
  "tt0120737", // The Fellowship of the Ring
];

function primaryGenre(genre: string | undefined | null): string | null {
  if (!genre) return null;
  return genre.split(",")[0]?.trim() || null;
}

async function fetchOmdb(imdbId: string, apiKey: string) {
  const url = new URL(OMDB_BASE_URL);
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("i", imdbId);
  url.searchParams.set("plot", "full");
  const res = await fetch(url.toString());
  return res.json();
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const omdbKey = process.env.OMDB_API_KEY;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  if (!omdbKey) throw new Error("OMDB_API_KEY is not set");

  const sql = postgres(connectionString, { ssl: "require" });

  console.log("Seeding demo users...");
  const adminHash = await bcrypt.hash("admin1234", 10);
  const userHash = await bcrypt.hash("user1234", 10);

  await sql`
    insert into users (email, password_hash, name, role)
    values (${"admin@demo.com"}, ${adminHash}, ${"Admin Demo"}, ${"admin"})
    on conflict (email) do nothing
  `;
  await sql`
    insert into users (email, password_hash, name, role)
    values (${"user@demo.com"}, ${userHash}, ${"Usuario Demo"}, ${"user"})
    on conflict (email) do nothing
  `;

  console.log("Seeding demo movies from OMDb...");
  let imported = 0;
  for (const imdbId of DEMO_IMDB_IDS) {
    const data = await fetchOmdb(imdbId, omdbKey);
    if (data.Response === "False") {
      console.warn(`  skip ${imdbId}: ${data.Error}`);
      continue;
    }

    const priceBuy = (9.99 + Math.random() * 10).toFixed(2);
    const priceRent = (2.99 + Math.random() * 3).toFixed(2);

    await sql`
      insert into movies (
        imdb_id, title, year, poster_url, genre, plot, imdb_rating, price_buy, price_rent
      ) values (
        ${imdbId},
        ${data.Title},
        ${data.Year},
        ${data.Poster === "N/A" ? null : data.Poster},
        ${primaryGenre(data.Genre)},
        ${data.Plot},
        ${data.imdbRating},
        ${priceBuy},
        ${priceRent}
      )
      on conflict (imdb_id) do nothing
    `;
    imported++;
    console.log(`  imported ${data.Title} (${imdbId})`);
    // Be polite to the free OMDb tier.
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`Seed complete. ${imported} movies processed.`);
  console.log("Demo credentials:");
  console.log("  admin@demo.com / admin1234");
  console.log("  user@demo.com  / user1234");

  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
