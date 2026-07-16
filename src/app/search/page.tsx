import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchClient } from "@/components/SearchClient";
import { BackButton } from "@/components/BackButton";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Buscar — Nébula",
  description: "Busca películas y series por título, tipo y género.",
};

export default async function SearchPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <BackButton fallback="/" label="Volver al catálogo" className="mb-6" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">Buscar</h1>
        <p className="mt-1 text-text-secondary">
          Encuentra cualquier título del catálogo por nombre, tipo o género.
        </p>
      </div>

      {/* useSearchParams needs a Suspense boundary around the client island. */}
      <Suspense fallback={null}>
        <SearchClient isLoggedIn={Boolean(user)} />
      </Suspense>
    </div>
  );
}
