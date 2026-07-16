import type { ReactNode } from "react";
import Link from "next/link";
import { LogoDark, LogoSymbol } from "@/components/Logo";
import { ArrowLeftIcon } from "@/components/icons";

const HIGHLIGHTS = [
  "Catálogo real de películas y series vía TMDB",
  "Checkout simulado con tarjetas, wallets y bancos",
  "Favoritos, historial y perfil en un solo lugar",
];

/**
 * Split auth screen. `formSide` mirrors the layout (login: form right,
 * register: form left) and the slide-in animations make switching between the
 * two feel like the panels glide across the screen.
 *
 * The wavy seam is a clip-path applied to the panel itself, so the wave "cuts"
 * the panel's real background (orbs included) and the page background shows
 * through — no color matching, no visible seam.
 */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  formSide = "right",
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  formSide?: "left" | "right";
}) {
  const formOnLeft = formSide === "left";

  return (
    <div className="grid min-h-dvh grid-cols-1 overflow-hidden md:grid-cols-2">
      {/* clip-paths normalizados (0..1) para la orilla ondulada del panel, normal y espejada. */}
      <svg aria-hidden width={0} height={0} className="absolute">
        <defs>
          <clipPath id="auth-wave" clipPathUnits="objectBoundingBox">
            <path d="M0,0 H0.93 C1.005,0.11 0.885,0.24 0.955,0.38 C1.015,0.51 0.89,0.63 0.95,0.76 C0.995,0.86 0.925,0.94 0.945,1 H0 Z" />
          </clipPath>
          <clipPath id="auth-wave-m" clipPathUnits="objectBoundingBox">
            <path d="M1,0 H0.07 C-0.005,0.11 0.115,0.24 0.045,0.38 C-0.015,0.51 0.11,0.63 0.05,0.76 C0.005,0.86 0.075,0.94 0.055,1 H1 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* ---- Panel de marca ---- */}
      <div
        style={{ clipPath: `url(#${formOnLeft ? "auth-wave-m" : "auth-wave"})` }}
        className={`relative hidden bg-dark-surface text-on-dark md:flex md:flex-col md:justify-between md:p-12 ${
          formOnLeft ? "md:order-2 animate-slide-in-right md:pl-16 lg:pl-24" : "animate-slide-in-left md:pr-16 lg:pr-24"
        }`}
      >
        <div
          aria-hidden
          className={`animate-orbit-glow pointer-events-none absolute -top-24 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl ${
            formOnLeft ? "-right-24" : "-left-24"
          }`}
          style={{ background: "linear-gradient(135deg, #1ebe91, #41cff0)" }}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute -bottom-28 h-[360px] w-[360px] rounded-full opacity-30 blur-3xl ${
            formOnLeft ? "-left-20" : "-right-20"
          }`}
          style={{ background: "#005073" }}
        />
        <div className="relative">
          <LogoDark width={160} />
        </div>
        <div className="relative">
          <p className="max-w-sm text-2xl font-semibold leading-snug tracking-tight">
            Todo tu catálogo, tu forma de pago y tu cuenta en un solo lugar.
          </p>
          <ul className="mt-8 flex flex-col gap-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-start gap-2.5 text-sm text-on-dark-soft">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {h}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-on-dark-soft/70">Nébula — prueba técnica, pagos simulados.</p>
      </div>

      {/* ---- Formulario ---- */}
      <div
        className={`relative flex items-center justify-center px-6 py-12 sm:py-16 ${
          formOnLeft ? "md:order-1 animate-slide-in-left" : "animate-slide-in-right"
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-24 hidden h-72 w-72 rounded-full opacity-15 blur-3xl md:block"
          style={{ background: "#1ebe91" }}
        />

        <div className="relative z-10 w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2.5 md:hidden">
            <LogoSymbol size={26} />
            <span className="text-lg font-bold tracking-tight text-text">Nébula</span>
          </div>
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-accent-alt"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Volver al catálogo
          </Link>

          <span aria-hidden className="mb-3 block h-1 w-12 rounded-full bg-gradient-nebula" />
          <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>

          <div className="mt-6">{children}</div>

          <div className="mt-4 text-sm text-text-secondary">{footer}</div>
        </div>
      </div>
    </div>
  );
}
