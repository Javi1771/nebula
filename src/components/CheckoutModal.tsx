"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PlaceholderArt } from "@/components/PlaceholderArt";

type Step = "form" | "processing" | "success" | "declined";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onPaid: () => void;
  movieId: string;
  movieTitle: string;
  posterUrl: string | null;
  type: "buy" | "rent";
  price: string | number;
}

interface FormState {
  name: string;
  number: string;
  expiry: string;
  cvc: string;
}

function luhnValid(digits: string) {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return digits.length >= 12 && sum % 10 === 0;
}

function detectBrand(digits: string): "Visa" | "Mastercard" | "Amex" | "Tarjeta" {
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  return "Tarjeta";
}

function formatNumber(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

const EMPTY_FORM: FormState = { name: "", number: "", expiry: "", cvc: "" };

export function CheckoutModal({
  open,
  onClose,
  onPaid,
  movieId,
  movieTitle,
  posterUrl,
  type,
  price,
}: CheckoutModalProps) {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setStep("form");
      setForm(EMPTY_FORM);
      setErrors({});
      setServerError(null);
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && step !== "processing") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step, onClose]);

  if (!open) return null;

  const digits = form.number.replace(/\D/g, "");
  const brand = detectBrand(digits);

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.name.trim().length < 3) next.name = "Ingresa el nombre como aparece en la tarjeta";
    if (!luhnValid(digits)) next.number = "Número de tarjeta inválido";

    const [mm, yy] = form.expiry.split("/");
    const now = new Date();
    const curYY = now.getFullYear() % 100;
    const curMM = now.getMonth() + 1;
    const monthNum = Number(mm);
    const yearNum = Number(yy);
    if (
      !mm ||
      !yy ||
      yy.length !== 2 ||
      monthNum < 1 ||
      monthNum > 12 ||
      yearNum < curYY ||
      (yearNum === curYY && monthNum < curMM)
    ) {
      next.expiry = "Fecha inválida";
    }

    if (form.cvc.length < 3) next.cvc = "CVC inválido";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStep("processing");
    setServerError(null);

    await new Promise((r) => setTimeout(r, 1200));

    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, type }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(data.error ?? "El pago fue rechazado");
        setStep("declined");
        return;
      }
      setStep("success");
      setTimeout(() => {
        onPaid();
        onClose();
      }, 1100);
    } catch {
      setServerError("No se pudo conectar con el servidor de pagos");
      setStep("declined");
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pago simulado"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-scale-in"
        onClick={() => step !== "processing" && onClose()}
      />

      <div className="relative w-full max-w-md animate-scale-in rounded-3xl border border-border bg-surface p-6 shadow-pop sm:p-7">
        {step !== "processing" && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-5 top-5 text-text-secondary transition-colors hover:text-accent"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        )}

        <div className="mb-5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-alt">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Pago simulado — demo, sin cargos reales
          </span>
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border bg-background/60 p-3">
          <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md">
            {posterUrl ? (
              <Image src={posterUrl} alt={movieTitle} fill sizes="44px" className="object-cover" />
            ) : (
              <PlaceholderArt className="absolute inset-0 rounded-none" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm font-semibold text-text">{movieTitle}</p>
            <p className="text-xs text-text-secondary">{type === "buy" ? "Compra" : "Renta · 48h"}</p>
          </div>
          <p className="text-lg font-bold text-text">${Number(price).toFixed(2)}</p>
        </div>

        {(step === "form" || step === "processing") && (
          <>
            <CardPreview name={form.name} number={form.number} expiry={form.expiry} cvc={form.cvc} brand={brand} flipped={flipped} />

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-sm text-text-secondary">
                Nombre en la tarjeta
                <input
                  ref={nameRef}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  onFocus={() => setFlipped(false)}
                  placeholder="Javier López"
                  disabled={step === "processing"}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-text focus:border-accent focus:outline-none disabled:opacity-60"
                />
                {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
              </label>

              <label className="flex flex-col gap-1 text-sm text-text-secondary">
                Número de tarjeta
                <input
                  inputMode="numeric"
                  value={form.number}
                  onChange={(e) => setForm((f) => ({ ...f, number: formatNumber(e.target.value) }))}
                  onFocus={() => setFlipped(false)}
                  placeholder="4242 4242 4242 4242"
                  disabled={step === "processing"}
                  className="rounded-lg border border-border bg-surface px-3 py-2 tabular-nums text-text focus:border-accent focus:outline-none disabled:opacity-60"
                />
                {errors.number && <span className="text-xs text-red-500">{errors.number}</span>}
              </label>

              <div className="flex gap-3">
                <label className="flex flex-1 flex-col gap-1 text-sm text-text-secondary">
                  Vencimiento
                  <input
                    inputMode="numeric"
                    value={form.expiry}
                    onChange={(e) => setForm((f) => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                    onFocus={() => setFlipped(false)}
                    placeholder="MM/AA"
                    disabled={step === "processing"}
                    className="rounded-lg border border-border bg-surface px-3 py-2 tabular-nums text-text focus:border-accent focus:outline-none disabled:opacity-60"
                  />
                  {errors.expiry && <span className="text-xs text-red-500">{errors.expiry}</span>}
                </label>
                <label className="flex flex-1 flex-col gap-1 text-sm text-text-secondary">
                  CVC
                  <input
                    inputMode="numeric"
                    value={form.cvc}
                    onChange={(e) => setForm((f) => ({ ...f, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                    onFocus={() => setFlipped(true)}
                    onBlur={() => setFlipped(false)}
                    placeholder="123"
                    disabled={step === "processing"}
                    className="rounded-lg border border-border bg-surface px-3 py-2 tabular-nums text-text focus:border-accent focus:outline-none disabled:opacity-60"
                  />
                  {errors.cvc && <span className="text-xs text-red-500">{errors.cvc}</span>}
                </label>
              </div>

              <button
                type="submit"
                disabled={step === "processing"}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-nebula px-5 py-3 text-sm font-semibold text-white shadow-pop transition-all hover:brightness-110 active:scale-95 disabled:opacity-70"
              >
                {step === "processing" ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Procesando pago...
                  </>
                ) : (
                  `Pagar $${Number(price).toFixed(2)}`
                )}
              </button>
            </form>
          </>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center animate-scale-in">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-nebula text-white shadow-pop">
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                <path d="M5 12.5 10 17l9-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="font-semibold text-text">Pago aprobado</p>
            <p className="text-sm text-text-secondary">Ya tienes acceso a {movieTitle}.</p>
          </div>
        )}

        {step === "declined" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center animate-scale-in">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-500">
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </span>
            <p className="font-semibold text-text">Pago rechazado</p>
            <p className="text-sm text-text-secondary">{serverError}</p>
            <button
              type="button"
              onClick={() => setStep("form")}
              className="mt-2 rounded-full border border-border px-5 py-2 text-sm font-semibold text-text transition-colors hover:border-accent hover:text-accent"
            >
              Volver a intentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CardPreview({
  name,
  number,
  expiry,
  cvc,
  brand,
  flipped,
}: {
  name: string;
  number: string;
  expiry: string;
  cvc: string;
  brand: string;
  flipped: boolean;
}) {
  return (
    <div className="[perspective:1000px]">
      <div
        className="relative h-44 w-full transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        <div
          className="absolute inset-0 flex flex-col justify-between rounded-2xl p-5 text-white [backface-visibility:hidden]"
          style={{ background: "linear-gradient(135deg, #6C4CF5 0%, #E94E92 100%)" }}
        >
          <div className="flex items-center justify-between">
            <span className="h-6 w-8 rounded-sm bg-white/25" />
            <span className="text-xs font-semibold uppercase tracking-wide opacity-90">{brand}</span>
          </div>
          <p className="text-lg font-semibold tabular-nums tracking-widest">
            {number || "•••• •••• •••• ••••"}
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="max-w-[60%] truncate uppercase opacity-90">{name || "NOMBRE APELLIDO"}</span>
            <span className="tabular-nums opacity-90">{expiry || "MM/AA"}</span>
          </div>
        </div>

        <div
          className="absolute inset-0 flex flex-col justify-center gap-2 rounded-2xl bg-[#221e2c] p-5 text-white [backface-visibility:hidden]"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="h-9 w-full bg-black/60" />
          <div className="flex justify-end">
            <span className="rounded bg-white px-3 py-1 text-sm font-semibold tracking-widest text-[#221e2c]">
              {cvc || "•••"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
