import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PlaceholderArt } from "@/components/PlaceholderArt";
import type { Movie, Purchase } from "@/lib/types";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const [movie] = await sql<Movie[]>`select * from movies where id = ${id}`;
  if (!movie) notFound();

  const purchases = await sql<Purchase[]>`
    select * from purchases
    where user_id = ${user.id} and movie_id = ${movie.id}
  `;
  const hasAccess = purchases.some(
    (p) =>
      p.type === "buy" ||
      (p.type === "rent" && p.rented_until && new Date(p.rented_until) > new Date())
  );

  if (!hasAccess) redirect(`/movies/${movie.id}`);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 text-center animate-fade-up">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent-secondary">
        Reproducción simulada
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-text">{movie.title}</h1>

      <div className="relative mx-auto mt-6 aspect-video w-full overflow-hidden rounded-2xl shadow-card">
        {movie.poster_url ? (
          <Image
            src={movie.poster_url}
            alt={movie.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover blur-[1px]"
          />
        ) : (
          <PlaceholderArt className="absolute inset-0 rounded-none" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-dark-surface/60">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-nebula px-6 py-3 text-sm font-bold text-white shadow-pop">
            ▶ Reproduciendo (demo)
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm text-text-secondary">
        Esta es una demo — no hay video real. Tienes acceso porque compraste o
        rentaste esta película.
      </p>
    </div>
  );
}
