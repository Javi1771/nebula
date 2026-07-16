import Link from "next/link";
import Image from "next/image";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PlaceholderArt } from "@/components/PlaceholderArt";
import { BackButton } from "@/components/BackButton";
import { CheckCircleIcon, ClockIcon, PlayIcon, WalletIcon } from "@/components/icons";
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
  const activeRentals = rentals.filter(
    (p) => p.rented_until && new Date(p.rented_until) > new Date()
  );

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10 animate-fade-up">
      <BackButton fallback="/" label="Volver al catálogo" className="mb-6" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-nebula text-ink shadow-pop">
            <ClockIcon className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">Mi biblioteca</h1>
            <p className="text-sm text-text-secondary">Todo lo que compraste o rentaste, listo para reproducir.</p>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard
          icon={<WalletIcon className="h-5 w-5" />}
          label="Saldo disponible"
          value={`$${Number(user.balance).toFixed(2)}`}
          accent
        />
        <StatCard icon={<CheckCircleIcon className="h-5 w-5" />} label="Compradas" value={String(owned.length)} />
        <StatCard icon={<ClockIcon className="h-5 w-5" />} label="Rentas activas" value={String(activeRentals.length)} />
      </div>

      <Section title="Compradas" subtitle="Acceso para siempre">
        {owned.length === 0 ? (
          <EmptyState message="Aún no has comprado películas ni series." />
        ) : (
          <LibraryGrid items={owned} />
        )}
      </Section>

      <Section title="Rentadas" subtitle="Disponibles 48 horas desde la renta">
        {rentals.length === 0 ? (
          <EmptyState message="Aún no has rentado películas ni series." />
        ) : (
          <LibraryGrid items={rentals} showExpiry />
        )}
      </Section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3.5 rounded-2xl border p-4 shadow-card ${
        accent ? "border-transparent bg-gradient-deep text-white" : "border-border bg-surface"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          accent ? "bg-white/15 text-white" : "bg-surface-elevated text-accent-alt"
        }`}
      >
        {icon}
      </span>
      <div>
        <p className={`text-xs font-medium ${accent ? "text-white/70" : "text-text-secondary"}`}>{label}</p>
        <p className={`text-xl font-bold tracking-tight ${accent ? "text-white" : "text-text"}`}>{value}</p>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold tracking-tight text-text">{title}</h2>
      <p className="text-xs text-text-secondary sm:text-sm">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border px-5 py-6">
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {items.map((item) => {
        const expired =
          showExpiry && item.rented_until && new Date(item.rented_until) <= new Date();

        return (
          <Link
            key={item.id}
            href={expired ? `/movies/${item.movie.id}` : `/movies/${item.movie.id}/watch`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-pop"
          >
            <div className="relative aspect-[2/3] w-full overflow-hidden">
              {item.movie.poster_url ? (
                <Image
                  src={item.movie.poster_url}
                  alt={item.movie.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className={`object-cover transition-transform duration-500 group-hover:scale-105 ${expired ? "grayscale opacity-60" : ""}`}
                />
              ) : (
                <PlaceholderArt className="absolute inset-0 rounded-none" />
              )}

              {!expired && (
                <span className="absolute inset-0 flex items-center justify-center bg-dark-surface/0 opacity-0 transition-all duration-300 group-hover:bg-dark-surface/40 group-hover:opacity-100">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-nebula text-ink shadow-pop">
                    <PlayIcon className="h-5 w-5" />
                  </span>
                </span>
              )}

              <span
                className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur ${
                  expired
                    ? "bg-dark-surface/80 text-on-dark-soft"
                    : item.type === "buy"
                      ? "bg-gradient-nebula text-ink shadow-pop"
                      : "bg-dark-surface/80 text-accent"
                }`}
              >
                {expired ? "Expirada" : item.type === "buy" ? "Tuya" : "Renta"}
              </span>
            </div>
            <div className="p-3">
              <p className="line-clamp-1 text-sm font-semibold text-text">{item.movie.title}</p>
              {showExpiry && item.rented_until && (
                <p className={`mt-1 text-xs ${expired ? "text-text-secondary" : "text-accent-tertiary-alt font-medium"}`}>
                  {expired
                    ? "Renta expirada"
                    : `Expira ${new Date(item.rented_until).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}`}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
