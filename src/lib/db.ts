import postgres from "postgres";

declare global {
  var __sql: ReturnType<typeof postgres> | undefined;
}

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return postgres(connectionString, { ssl: "require" });
}

// Reuse the connection across hot reloads in dev instead of exhausting Neon's pool.
export const sql = global.__sql ?? createClient();

if (process.env.NODE_ENV !== "production") {
  global.__sql = sql;
}
