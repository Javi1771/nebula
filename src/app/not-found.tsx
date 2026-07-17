import { ButtonLink } from "@/components/Button";
import { FilmIcon, SearchIcon } from "@/components/icons";

export const metadata = {
  title: "Página no encontrada — Nébula",
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-[75vh] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      <div
        aria-hidden
        className="animate-orbit-glow pointer-events-none absolute h-[420px] w-[420px] rounded-full opacity-20 blur-3xl"
        style={{ background: "linear-gradient(135deg, #1ebe91, #41cff0)" }}
      />

      <div className="relative">
        <div className="flex items-center justify-center gap-2">
          <FilmIcon className="h-9 w-9 text-accent" />
          <span className="text-gradient-nebula text-7xl font-extrabold tracking-tight sm:text-8xl">404</span>
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-text sm:text-3xl">
          Esta página se perdió en el espacio
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
          La URL que buscas no existe, cambió de lugar o el título ya no está disponible.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/">Volver al catálogo</ButtonLink>
          <ButtonLink href="/search" variant="secondary">
            <SearchIcon className="h-4 w-4" />
            Buscar títulos
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
