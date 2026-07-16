import { CatalogClient } from "@/components/CatalogClient";

const FEATURES = [
  { label: "Catálogo real vía OMDb" },
  { label: "Pago simulado, sin riesgo" },
  { label: "Acceso instantáneo a tu biblioteca" },
];

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/10 bg-dark-surface text-on-dark">
        <div
          aria-hidden
          className="animate-orbit-glow pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
          style={{ background: "linear-gradient(135deg, #6C4CF5, #E94E92)" }}
        />

        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-accent-tertiary animate-fade-up"
            style={{ animationDelay: "0ms" }}
          >
            Catálogo Nebula
          </span>
          <h1
            className="mt-4 max-w-xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl animate-fade-up"
            style={{ animationDelay: "80ms" }}
          >
            Compra o renta tus <span className="text-gradient-nebula">películas favoritas</span>
          </h1>
          <p
            className="mt-5 max-w-md text-base text-on-dark-soft animate-fade-up"
            style={{ animationDelay: "160ms" }}
          >
            Explora el catálogo, filtra por género y accede a tus películas
            compradas o rentadas desde tu biblioteca.
          </p>

          <div
            className="mt-8 flex flex-wrap gap-2.5 animate-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            {FEATURES.map((f) => (
              <span
                key={f.label}
                className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-on-dark-soft"
              >
                {f.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <CatalogClient />
      </section>
    </div>
  );
}
