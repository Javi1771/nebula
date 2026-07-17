"use client";

import { startTransition, useEffect, useState } from "react";
import { toast } from "sonner";
import { getBank } from "@/lib/banks";
import { getSavedCards, removeSavedCard, type SavedCard } from "@/lib/savedCards";
import { CardIcon } from "@/components/icons";

export function PaymentMethodsClient({ userId }: { userId: string }) {
  const [cards, setCards] = useState<SavedCard[]>([]);

  // localStorage isn't available during SSR — hydrate the list after mount.
  useEffect(() => {
    startTransition(() => setCards(getSavedCards(userId)));
  }, [userId]);

  function remove(id: string) {
    setCards(removeSavedCard(userId, id));
    toast("Tarjeta eliminada");
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-text">Métodos de pago guardados</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Se guardan solo en este navegador — nunca el número completo ni el CVC, solo los últimos 4 dígitos.
      </p>

      {cards.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-12 text-center">
          <CardIcon className="h-6 w-6 text-text-secondary" />
          <p className="text-sm text-text-secondary">
            Aún no tienes tarjetas guardadas. Se agregan desde el checkout al comprar o rentar.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {cards.map((c) => {
            const bank = getBank(c.bankId);
            return (
              <div
                key={c.id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-card"
              >
                <span
                  className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg text-white"
                  style={{ background: bank.gradient }}
                >
                  <CardIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text">
                    {bank.name} •••• {c.last4}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {c.name} · vence {c.expiry}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  className="text-sm font-medium text-text-secondary transition-colors hover:text-red-500"
                >
                  Eliminar
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
