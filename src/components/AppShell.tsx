"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { LogoDark, LogoSymbol } from "@/components/Logo";
import { Avatar } from "@/components/Avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoutButton } from "@/components/LogoutButton";
import {
  ClockIcon,
  HeartIcon,
  HomeIcon,
  LogoutIcon,
  SearchIcon,
  ShieldIcon,
  UserIcon,
  WalletIcon,
} from "@/components/icons";

export interface ShellUser {
  name: string;
  email: string;
  balance: string;
  role: string;
  avatarUrl: string | null;
}

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const EXPLORE_ITEMS: NavItem[] = [
  { href: "/", label: "Catálogo", icon: HomeIcon },
  { href: "/search", label: "Buscar", icon: SearchIcon },
  { href: "/favorites", label: "Favoritos", icon: HeartIcon },
  { href: "/library", label: "Mi biblioteca", icon: ClockIcon },
];

const ACCOUNT_ITEM: NavItem = { href: "/account", label: "Mi cuenta", icon: UserIcon };
const ADMIN_ITEM: NavItem = { href: "/admin", label: "Administración", icon: ShieldIcon };

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Auth and playback are immersive, single-purpose screens — no chrome there. */
function chromeHiddenOn(pathname: string) {
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.includes("/watch")
  );
}

/** Ambient brand orbs floating behind every page. */
export function AmbientOrbs() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="orb -top-32 right-[-10%] h-[420px] w-[420px] opacity-25" style={{ background: "#1ebe91" }} />
      <div className="orb top-[38%] left-[-8%] h-[360px] w-[360px] opacity-20" style={{ background: "#41cff0" }} />
      <div className="orb bottom-[-12%] right-[22%] h-[380px] w-[380px] opacity-15" style={{ background: "#005073" }} />
    </div>
  );
}

function DesktopNavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={item.label}
      aria-current={active ? "page" : undefined}
      className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
        active
          ? "bg-white/10 text-white shadow-pop"
          : "text-on-dark-soft hover:bg-white/5 hover:text-white"
      }`}
    >
      {active && <span aria-hidden className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-gradient-nebula" />}
      <Icon className={`h-5 w-5 shrink-0 transition-colors ${active ? "text-accent" : "text-on-dark-soft group-hover:text-white"}`} />
      <span className="hidden whitespace-nowrap group-hover/side:inline">{item.label}</span>
    </Link>
  );
}

/**
 * App chrome: full sidebar on desktop (logo, nav, user card), slim top bar +
 * bottom tab bar on mobile. Replaces the old sticky header + floating icon dock.
 */
export function AppShell({ user, children }: { user: ShellUser | null; children: ReactNode }) {
  const pathname = usePathname();
  const hidden = chromeHiddenOn(pathname);

  if (hidden) {
    return <main className="flex-1">{children}</main>;
  }

  const navItems = [...EXPLORE_ITEMS, ACCOUNT_ITEM];
  const mobileItems = navItems;

  return (
    <>
      <AmbientOrbs />

      {/* ---- Desktop sidebar: flotante, colapsada a iconos; se expande con el mouse ---- */}
      <aside className="group/side fixed bottom-4 left-4 top-4 z-40 hidden w-[76px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-dark-surface text-on-dark shadow-pop transition-[width] duration-300 ease-out hover:w-64 lg:flex">
        <div aria-hidden className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full opacity-25 blur-3xl" style={{ background: "linear-gradient(135deg, #1ebe91, #41cff0)" }} />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-16 h-56 w-56 rounded-full opacity-20 blur-3xl" style={{ background: "#005073" }} />

        <Link
          href="/"
          className="relative flex items-center justify-center gap-2.5 pb-6 pt-7 group-hover/side:justify-start group-hover/side:px-6"
        >
          <LogoSymbol size={30} tone="onDark" />
          <span className="hidden text-lg font-bold tracking-tight text-on-dark group-hover/side:inline">Nébula</span>
        </Link>

        <nav aria-label="Navegación principal" className="relative flex flex-1 flex-col gap-6 overflow-y-auto px-3">
          <div>
            <p className="hidden px-3.5 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-on-dark-soft/60 group-hover/side:block">
              Explorar
            </p>
            <div className="flex flex-col gap-1">
              {EXPLORE_ITEMS.map((item) => (
                <DesktopNavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
              ))}
            </div>
          </div>

          <div>
            <p className="hidden px-3.5 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-on-dark-soft/60 group-hover/side:block">
              Tu espacio
            </p>
            <div className="flex flex-col gap-1">
              <DesktopNavLink item={ACCOUNT_ITEM} active={isActive(pathname, ACCOUNT_ITEM.href)} />
              {user?.role === "admin" && (
                <DesktopNavLink item={ADMIN_ITEM} active={isActive(pathname, ADMIN_ITEM.href)} />
              )}
            </div>
          </div>
        </nav>

        <div className="relative border-t border-white/10 p-3 group-hover/side:p-4">
          {user ? (
            <div className="flex flex-col gap-3">
              <div className="hidden items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 group-hover/side:flex">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-on-dark-soft">
                  <WalletIcon className="h-4 w-4 text-accent" />
                  Saldo
                </span>
                <span className="text-sm font-bold text-accent">${Number(user.balance).toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-center gap-3 group-hover/side:justify-start">
                <Link
                  href="/account"
                  title="Mi cuenta"
                  className="flex min-w-0 items-center gap-2.5 rounded-xl px-1 py-1 transition-colors hover:bg-white/5 group-hover/side:flex-1"
                >
                  <Avatar name={user.name || user.email} avatarUrl={user.avatarUrl} size={36} />
                  <span className="hidden min-w-0 group-hover/side:block">
                    <span className="block truncate text-sm font-semibold text-on-dark">{user.name}</span>
                    <span className="block truncate text-[11px] text-on-dark-soft">{user.email}</span>
                  </span>
                </Link>
                <span className="hidden group-hover/side:inline-flex">
                  <ThemeToggle />
                </span>
                <LogoutButton
                  title="Cerrar sesión"
                  className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl text-on-dark-soft transition-colors hover:bg-white/10 hover:text-accent-secondary disabled:opacity-50 group-hover/side:flex"
                >
                  <LogoutIcon className="h-[18px] w-[18px]" />
                </LogoutButton>
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                title="Iniciar sesión"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-nebula text-ink shadow-pop transition-transform hover:scale-105 group-hover/side:hidden mx-auto"
              >
                <UserIcon className="h-5 w-5" />
              </Link>
              <div className="hidden flex-col gap-2.5 group-hover/side:flex">
                <Link
                  href="/register"
                  className="rounded-xl bg-gradient-nebula px-4 py-2.5 text-center text-sm font-semibold text-ink shadow-pop transition-transform hover:scale-[1.02] active:scale-95"
                >
                  Crear cuenta
                </Link>
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-center text-sm font-semibold text-on-dark transition-all hover:border-accent/60 hover:bg-white/10 hover:text-accent active:scale-95"
                  >
                    Iniciar sesión
                  </Link>
                  <ThemeToggle />
                </div>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* ---- Mobile top bar ---- */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-dark-surface/95 px-4 py-3 text-on-dark backdrop-blur lg:hidden">
        <Link href="/">
          <LogoDark width={110} />
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-accent">
                <WalletIcon className="h-3.5 w-3.5" />${Number(user.balance).toFixed(2)}
              </span>
              <ThemeToggle />
              <Link href="/account" aria-label="Mi cuenta">
                <Avatar name={user.name || user.email} avatarUrl={user.avatarUrl} size={30} />
              </Link>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link
                href="/login"
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-on-dark transition-colors hover:border-accent hover:text-accent"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-gradient-nebula px-3 py-1.5 text-xs font-semibold text-ink shadow-pop"
              >
                Registro
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 pb-24 lg:pb-0 lg:pl-[108px]">
        {children}
        <ShellFooter />
      </main>

      {/* ---- Mobile bottom tabs ---- */}
      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-white/10 bg-dark-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        {mobileItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-on-dark-soft transition-colors"
            >
              <Icon className={`h-5 w-5 transition-colors ${active ? "text-accent" : ""}`} />
              <span className={`text-[10px] font-medium transition-colors ${active ? "text-white" : ""}`}>
                {item.label.replace("Mi ", "")}
              </span>
              {active && <span className="mt-0.5 h-1 w-1 rounded-full bg-accent" />}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

const FOOTER_LINKS = [
  { href: "/", label: "Catálogo" },
  { href: "/search", label: "Buscar" },
  { href: "/favorites", label: "Favoritos" },
  { href: "/library", label: "Mi biblioteca" },
  { href: "/account", label: "Mi cuenta" },
];

/** Brand footer rendered inside the padded content column. */
export function ShellFooter() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-border px-6 pb-10 pt-12 text-sm text-text-secondary">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-1/2 h-64 w-[520px] -translate-x-1/2 rounded-full opacity-10 blur-3xl"
        style={{ background: "linear-gradient(135deg, #1ebe91, #41cff0)" }}
      />

      <div className="relative mx-auto flex max-w-screen-2xl flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-sm">
          <span className="inline-flex items-center gap-2.5 text-text">
            <LogoSymbol size={24} />
            <span className="text-lg font-bold tracking-tight">Nébula</span>
          </span>
          <p className="mt-3 leading-relaxed">
            Compra o renta películas y series en un catálogo real servido por TMDB. Demo técnica — todos los pagos son
            simulados, sin cargos reales.
          </p>
        </div>

        <nav aria-label="Enlaces del sitio" className="flex flex-wrap gap-x-8 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="font-medium transition-colors hover:text-accent-alt">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="relative mx-auto mt-10 flex max-w-screen-2xl flex-col gap-2 border-t border-border pt-5 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Nébula. Proyecto de demostración.</p>
        <p>
          Datos e imágenes de{" "}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-accent-alt transition-colors hover:text-accent"
          >
            TMDB
          </a>
          . Este producto usa la API de TMDB sin ser avalado ni certificado por TMDB.
        </p>
      </div>
    </footer>
  );
}
