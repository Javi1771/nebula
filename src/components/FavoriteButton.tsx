"use client";

import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { toast } from "sonner";
import { HeartIcon } from "@/components/icons";

interface FavoriteButtonProps {
  movieId: string;
  isLoggedIn: boolean;
  initialFavorited?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function FavoriteButton({
  movieId,
  isLoggedIn,
  initialFavorited = false,
  size = "sm",
  className = "",
}: FavoriteButtonProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const dims = size === "sm" ? "h-8 w-8" : "h-11 w-11";
  const iconDims = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  async function toggle(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (loading) return;

    const next = !favorited;
    setFavorited(next);
    setLoading(true);
    try {
      const res = await fetch(
        next ? "/api/favorites" : `/api/favorites?movieId=${movieId}`,
        next
          ? {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ movieId }),
            }
          : { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      if (next) toast("Agregado a favoritos");
    } catch {
      setFavorited(!next);
      toast.error("No se pudo actualizar favoritos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
      aria-pressed={favorited}
      className={`inline-flex ${dims} items-center justify-center rounded-full bg-dark-surface/80 text-on-dark backdrop-blur transition-all hover:scale-110 active:scale-90 ${className}`}
    >
      {/* Hueco por defecto; relleno verde de marca cuando ya está en favoritos. */}
      <HeartIcon
        className={`${iconDims} transition-colors ${favorited ? "fill-accent text-accent" : "fill-transparent text-on-dark"}`}
      />
    </button>
  );
}
