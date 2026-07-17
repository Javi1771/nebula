"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { CheckoutModal } from "@/components/CheckoutModal";
import { LockIcon } from "@/components/icons";

interface BuyRentButtonsProps {
  movieId: string;
  movieTitle: string;
  posterUrl: string | null;
  priceBuy: string;
  priceRent: string;
  isLoggedIn: boolean;
  userId: string | null;
  owned: boolean;
  activeRentUntil: string | null;
}

export function BuyRentButtons({
  movieId,
  movieTitle,
  posterUrl,
  priceBuy,
  priceRent,
  isLoggedIn,
  userId,
  owned,
  activeRentUntil,
}: BuyRentButtonsProps) {
  const router = useRouter();
  const [checkout, setCheckout] = useState<"buy" | "rent" | null>(null);

  if (!isLoggedIn || !userId) {
    return (
      <div className="flex flex-wrap gap-3">
        <ButtonLink
          href="/login"
          className="px-6 py-3 ring-2 ring-white/20 ring-offset-2 ring-offset-transparent hover:ring-white/40"
        >
          <LockIcon className="h-4 w-4" />
          Inicia sesión para comprar o rentar
        </ButtonLink>
      </div>
    );
  }

  if (owned || activeRentUntil) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <ButtonLink href={`/movies/${movieId}/watch`}>Ver ahora</ButtonLink>
        {activeRentUntil && !owned && (
          <span className="text-sm text-text-secondary">
            Renta activa hasta {new Date(activeRentUntil).toLocaleString()}
          </span>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setCheckout("buy")}>Comprar ${Number(priceBuy).toFixed(2)}</Button>
        <Button variant="secondary-dark" onClick={() => setCheckout("rent")}>
          Rentar ${Number(priceRent).toFixed(2)} (48h)
        </Button>
      </div>

      <CheckoutModal
        open={checkout !== null}
        onClose={() => setCheckout(null)}
        onPaid={() => router.refresh()}
        movieId={movieId}
        movieTitle={movieTitle}
        posterUrl={posterUrl}
        type={checkout ?? "buy"}
        price={checkout === "rent" ? priceRent : priceBuy}
        userId={userId}
      />
    </div>
  );
}
