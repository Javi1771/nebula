import "server-only";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";
import type { PublicUser } from "@/lib/types";

/** Full user row (minus password_hash) for the currently logged-in session, or null if anonymous. */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const session = await getSession();
  if (!session) return null;

  const rows = await sql<PublicUser[]>`
    select id, email, name, role, balance, created_at
    from users
    where id = ${session.userId}
  `;
  return rows[0] ?? null;
}

/** For Server Components: redirects to /login if there is no session. */
export async function requireUser(): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** For Server Components: redirects if there is no session or the user isn't an admin. */
export async function requireAdmin(): Promise<PublicUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}
