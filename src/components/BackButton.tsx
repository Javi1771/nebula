"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";
import { lastVisited } from "@/lib/navHistory";

/**
 * Back button that always lands where its label promises: it pushes the most
 * recent visited URL for the fallback route (preserving filters/search in the
 * query string) instead of a blind history.back(), which could land on another
 * movie in a chain, a login page, or outside the app.
 */
export function BackButton({
  fallback = "/",
  label = "Regresar",
  tone = "light",
  className = "",
}: {
  fallback?: string;
  label?: string;
  /** "dark" for on-dark hero surfaces, "light" for regular page background. */
  tone?: "dark" | "light";
  className?: string;
}) {
  const router = useRouter();

  const toneClass =
    tone === "dark"
      ? "border-white/15 bg-white/10 text-white backdrop-blur hover:bg-white/20"
      : "border-border bg-surface text-text-secondary shadow-card hover:border-accent hover:text-accent";

  return (
    <button
      type="button"
      onClick={() => {
        router.push(lastVisited(fallback.split("?")[0]) ?? fallback);
      }}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all active:scale-95 ${toneClass} ${className}`}
    >
      <ArrowLeftIcon className="h-4 w-4" />
      {label}
    </button>
  );
}
