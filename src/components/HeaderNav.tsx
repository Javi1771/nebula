"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoutButton } from "@/components/LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderNavProps {
  user: { name: string; balance: string; role: string } | null;
}

const linkClass =
  "text-sm text-on-dark-soft hover:text-accent-tertiary transition-colors";

export function HeaderNav({ user }: HeaderNavProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <nav className="hidden items-center gap-6 md:flex">
        <Link href="/" className={linkClass}>
          Catálogo
        </Link>
        {user && (
          <Link href="/library" className={linkClass}>
            Mi biblioteca
          </Link>
        )}
        {user?.role === "admin" && (
          <Link href="/admin" className={linkClass}>
            Admin
          </Link>
        )}

        <span aria-hidden className="h-1 w-1 rounded-full bg-accent-secondary/50" />

        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-on-dark-soft">
              {user.name} · <span className="font-semibold text-accent-tertiary">${Number(user.balance).toFixed(2)}</span>
            </span>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className={linkClass}>
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-gradient-nebula px-4 py-1.5 text-sm font-semibold text-white shadow-pop transition-transform hover:scale-105 active:scale-95"
            >
              Registrarse
            </Link>
          </div>
        )}

        <ThemeToggle />
      </nav>

      <div className="flex items-center gap-1 md:hidden">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          className="relative flex h-9 w-9 items-center justify-center text-on-dark"
        >
          <span className="relative block h-4 w-5">
            <span
              className={`absolute left-0 h-[1.5px] w-5 bg-current transition-all duration-300 ${
                open ? "top-[7px] rotate-45" : "top-0 rotate-0"
              }`}
            />
            <span
              className={`absolute left-0 top-[7px] h-[1.5px] w-5 bg-current transition-opacity duration-300 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 h-[1.5px] w-5 bg-current transition-all duration-300 ${
                open ? "top-[7px] -rotate-45" : "top-[14px] rotate-0"
              }`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div className="absolute inset-x-0 top-full border-t border-white/10 bg-dark-surface px-6 py-5 md:hidden animate-fade-up">
          <nav className="flex flex-col gap-4">
            <Link href="/" className={linkClass} onClick={close}>
              Catálogo
            </Link>
            {user && (
              <Link href="/library" className={linkClass} onClick={close}>
                Mi biblioteca
              </Link>
            )}
            {user?.role === "admin" && (
              <Link href="/admin" className={linkClass} onClick={close}>
                Admin
              </Link>
            )}

            <div className="my-1 h-px bg-white/10" />

            {user ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-dark-soft">
                  {user.name} · <span className="font-semibold text-accent-tertiary">${Number(user.balance).toFixed(2)}</span>
                </span>
                <LogoutButton />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className={linkClass} onClick={close}>
                  Entrar
                </Link>
                <Link
                  href="/register"
                  onClick={close}
                  className="rounded-full bg-gradient-nebula px-4 py-1.5 text-sm font-semibold text-white"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
