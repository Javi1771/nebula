import Link from "next/link";
import Image from "next/image";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PlaceholderArt } from "@/components/PlaceholderArt";
import type { Movie, Purchase } from "@/lib/types";

export default async function LibraryPage() {
  const user = await requireUser();

  const purchases = await sql<(Purchase & { movie: Movie })[]>`
    select p.*, row_to_json(m.*) as movie
    from purchases p
    join movies m on m.id = p.movie_id
    where p.user_id = ${user.id}
    order by p.created_at desc
  `;

  const owned = purchases.filter((p) => p.type === "buy");
  const rentals = purchases.filter((p) => p.type === "rent");

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 animate-fade-up">
      <h1 className="text-2xl font-bold tracking-tight text-text">Mi biblioteca</h1>
      <p className="mt-1 text-text-secondary">
        Saldo disponible: <span className="font-semibold text-accent-alt">${Number(user.balance).toFixed(2)}</span>
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-text">Compradas</h2>
        {owned.length === 0 ? (
          <EmptyState message="Aún no has comprado películas." />
        ) : (
          <LibraryGrid items={owned} />
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-text">Rentadas</h2>
        {rentals.length === 0 ? (
          <EmptyState message="Aún no has rentado películas." />
        ) : (
          <LibraryGrid items={rentals} showExpiry />
        )}
      </section>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-border px-5 py-6">
      <span className="h-8 w-8 shrink-0 rounded-full bg-gradient-nebula opacity-70" />
      <p className="text-sm text-text-secondary">{message}</p>
    </div>
  );
}

function LibraryGrid({
  items,
  showExpiry = false,
}: {
  items: (Purchase & { movie: Movie })[];
  showExpiry?: boolean;
}) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const expired =
          showExpiry && item.rented_until && new Date(item.rented_until) <= new Date();

        return (
          <Link
            key={item.id}
            href={expired ? `/movies/${item.movie.id}` : `/movies/${item.movie.id}/watch`}
            className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="relative aspect-[2/3] w-full">
              {item.movie.poster_url ? (
                <Image
                  src={item.movie.poster_url}
                  alt={item.movie.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className={`object-cover ${expired ? "grayscale opacity-60" : ""}`}
                />
              ) : (
                <PlaceholderArt className="absolute inset-0 rounded-none" />
              )}
            </div>
            <div className="p-3">
              <p className="line-clamp-1 text-sm font-semibold text-text">{item.movie.title}</p>
              {showExpiry && item.rented_until && (
                <p className="mt-1 text-xs text-text-secondary">
                  {expired
                    ? "Renta expirada"
                    : `Expira ${new Date(item.rented_until).toLocaleString()}`}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
