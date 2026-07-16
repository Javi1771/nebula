"use client";

import { startTransition, useEffect, useState } from "react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  // The real theme lives on <html data-theme> (set pre-paint by ThemeScript);
  // sync it into state after mount since SSR can't know the stored preference.
  useEffect(() => {
    startTransition(() => {
      setTheme((document.documentElement.dataset.theme as "light" | "dark") ?? "light");
    });
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("nebula-theme", next);
    setTheme(next);
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className={`relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-on-dark/80 transition-colors hover:text-accent-tertiary ${className}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        className={`absolute h-[18px] w-[18px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isDark ? "-translate-y-6 rotate-90 opacity-0" : "translate-y-0 rotate-0 opacity-100"
        }`}
      >
        <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
        <path
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
        />
      </svg>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        className={`absolute h-[18px] w-[18px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isDark ? "translate-y-0 rotate-0 opacity-100" : "translate-y-6 -rotate-90 opacity-0"
        }`}
      >
        <path
          fill="currentColor"
          d="M20.4 14.7A8.5 8.5 0 1 1 9.3 3.6a7 7 0 0 0 11.1 11.1Z"
        />
      </svg>
    </button>
  );
}
