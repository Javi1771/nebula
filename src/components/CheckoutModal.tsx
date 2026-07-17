"use client";

import Image from "next/image";
import { startTransition, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { PlaceholderArt } from "@/components/PlaceholderArt";
import { BANKS, getBank, textureStyle, type Bank } from "@/lib/banks";
import { getSavedCards, saveCard, type SavedCard } from "@/lib/savedCards";
import {
  AmexMark,
  AppleLogoIcon,
  CardIcon,
  CheckCircleIcon,
  FingerprintIcon,
  GoogleGIcon,
  MastercardMark,
  SamsungPayIcon,
  SparklesIcon,
  VisaMark,
} from "@/components/icons";

type Step = "form" | "wallet" | "processing" | "success" | "declined";
type WalletProvider = "google" | "apple" | "samsung";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onPaid: () => void;
  movieId: string;
  movieTitle: string;
  posterUrl: string | null;
  type: "buy" | "rent";
  price: string | number;
  userId: string;
}

interface FormState {
  name: string;
  number: string;
  expiry: string;
  cvc: string;
}

const WALLETS: { id: WalletProvider; label: string; icon: ReactNode; className: string }[] = [
  {
    id: "google",
    label: "Google Pay",
    icon: <GoogleGIcon />,
    className: "border border-border bg-surface text-text hover:border-accent",
  },
  {
    id: "apple",
    label: "Apple Pay",
    icon: <AppleLogoIcon className="h-4 w-4 text-white" />,
    className: "bg-black text-white hover:brightness-125",
  },
  {
    id: "samsung",
    label: "Samsung Pay",
    icon: <SamsungPayIcon className="h-4 w-4" />,
    className: "bg-[#1428A0] text-white hover:brightness-110",
  },
];

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
  const digits = raw.replace(/\D/g, "");
  // Amex uses 15 digits grouped 4-6-5 instead of blocks of 4.
  if (/^3[47]/.test(digits)) {
    const d = digits.slice(0, 15);
    return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(" ");
  }
  return digits.slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

const EMPTY_FORM: FormState = { name: "", number: "", expiry: "", cvc: "" };

/** Luhn-valid public test numbers (Stripe docs) — this is a simulator, nothing is charged. */
const TEST_CARDS = [
  "4242 4242 4242 4242",
  "4012 8888 8888 1881",
  "5555 5555 5555 4444",
  "2223 0031 2200 3222",
  "3782 822463 10005",
  "3714 496353 98431",
];

const TEST_NAMES = [
  "María Fernanda Ruiz",
  "Carlos Hernández",
  "Ana Sofía Delgado",
  "Javier López",
  "Valeria Ortiz",
  "Diego Ramírez",
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function BrandMark({ brand, tone }: { brand: string; tone: "light" | "dark" | "auto" }) {
  if (brand === "Visa") {
    const color =
      tone === "light" ? "text-white" : tone === "dark" ? "text-[#1A1F71]" : "text-text";
    return <VisaMark className={`h-4 w-10 ${color}`} />;
  }
  if (brand === "Mastercard") return <MastercardMark className="h-5 w-8" />;
  if (brand === "Amex") return <AmexMark className="h-5 w-9" />;
  return null;
}

export function CheckoutModal({
  open,
  onClose,
  onPaid,
  movieId,
  movieTitle,
  posterUrl,
  type,
  price,
  userId,
}: CheckoutModalProps) {
  const [step, setStep] = useState<Step>("form");
  const [wallet, setWallet] = useState<WalletProvider | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [bankId, setBankId] = useState("generic");
  const [remember, setRemember] = useState(false);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      startTransition(() => {
        setStep("form");
        setWallet(null);
        setForm(EMPTY_FORM);
        setBankId("generic");
        setRemember(false);
        setErrors({});
        setServerError(null);
        setSavedCards(getSavedCards(userId));
      });
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

  if (!open || typeof document === "undefined") return null;

  const digits = form.number.replace(/\D/g, "");
  const brand = detectBrand(digits);
  const bank = getBank(bankId);

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

  async function runPurchase(delayMs: number, onBeforeSuccess?: () => void) {
    setStep("processing");
    setServerError(null);

    await new Promise((r) => setTimeout(r, delayMs));

    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, type }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message = data.error ?? "El pago fue rechazado";
        setServerError(message);
        setStep("declined");
        toast.error(message);
        return;
      }
      onBeforeSuccess?.();
      setStep("success");
      toast.success(`Pago aprobado — ya tienes acceso a ${movieTitle}`);
      setTimeout(() => {
        onPaid();
        onClose();
      }, 1100);
    } catch {
      setServerError("No se pudo conectar con el servidor de pagos");
      setStep("declined");
      toast.error("No se pudo conectar con el servidor de pagos");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await runPurchase(1200, () => {
      if (remember) {
        setSavedCards(
          saveCard(userId, { bankId, last4: digits.slice(-4), name: form.name.trim(), expiry: form.expiry })
        );
        toast("Tarjeta guardada para la próxima vez");
      }
    });
  }

  function payWithSavedCard() {
    void runPurchase(900);
  }

  function fillTestData() {
    const number = pick(TEST_CARDS);
    const isAmex = /^3[47]/.test(number);
    const now = new Date();
    const mm = String(1 + Math.floor(Math.random() * 12)).padStart(2, "0");
    const yy = String((now.getFullYear() + 1 + Math.floor(Math.random() * 4)) % 100).padStart(2, "0");
    const cvcLen = isAmex ? 4 : 3;
    const cvc = String(Math.floor(Math.random() * 10 ** cvcLen)).padStart(cvcLen, "0");
    setForm({ name: pick(TEST_NAMES), number, expiry: `${mm}/${yy}`, cvc });
    setBankId(pick(BANKS).id);
    setErrors({});
    setFlipped(false);
  }

  function payWithWallet(provider: WalletProvider) {
    setWallet(provider);
    setStep("wallet");
    setTimeout(() => {
      void runPurchase(900);
    }, 1500);
  }

  const showForm = step === "form";

  // Portal to <body>: animated ancestors (transform) would otherwise become the
  // containing block for position:fixed and push the dialog out of the viewport.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pago simulado"
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-4 py-8 sm:items-center"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-scale-in"
        onClick={() => step !== "processing" && step !== "wallet" && onClose()}
      />

      <div
        className={`relative my-auto max-h-[calc(100vh-4rem)] w-full animate-scale-in overflow-y-auto rounded-3xl border border-border bg-surface p-5 shadow-pop transition-[max-width] duration-300 sm:p-7 ${
          showForm ? "max-w-md md:max-w-3xl xl:max-w-6xl" : "max-w-md"
        }`}
      >
        {step !== "processing" && step !== "wallet" && (
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

        <div className="mb-5 flex items-center gap-2 pr-8">
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

        {showForm && (
          <>
            <div className="flex flex-wrap gap-2">
              {WALLETS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => payWithWallet(w.id)}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95 ${w.className}`}
                >
                  {w.icon}
                  {w.label}
                </button>
              ))}
            </div>

            {savedCards.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Tarjetas guardadas</p>
                <div className="mt-2 flex flex-col gap-2">
                  {savedCards.map((c) => {
                    const cardBank = getBank(c.bankId);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={payWithSavedCard}
                        className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-left transition-colors hover:border-accent"
                      >
                        <span
                          className={`relative flex h-8 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md text-[9px] font-bold ${
                            cardBank.text === "dark" ? "text-neutral-800" : "text-white"
                          }`}
                          style={{ background: cardBank.gradient }}
                        >
                          {(() => {
                            const t = textureStyle(cardBank);
                            return t ? <span className="absolute inset-0" style={t} /> : null;
                          })()}
                          <CardIcon className="relative h-4 w-4" />
                        </span>
                        <span className="flex-1 text-sm text-text">
                          {cardBank.name} •••• {c.last4}
                        </span>
                        <span className="text-xs text-text-secondary">{c.expiry}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="my-5 flex items-center gap-3 text-xs text-text-secondary">
              <span className="h-px flex-1 bg-border" />
              Pagar con tarjeta nueva
              <span className="h-px flex-1 bg-border" />
            </div>

            {/* md: 2 columnas (bancos+tarjeta | formulario). xl: 3 columnas (bancos | tarjeta | formulario) para eliminar el scroll. */}
            <div className="md:grid md:grid-cols-2 md:items-start md:gap-x-7 xl:grid-cols-3 xl:gap-x-8">
            <div className="min-w-0 xl:col-span-2 xl:grid xl:grid-cols-2 xl:items-start xl:gap-x-8">
            <div className="min-w-0">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Diseño de tu banco</p>
              <button
                type="button"
                onClick={fillTestData}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-accent/50 px-3 py-1 text-xs font-medium text-accent-alt transition-colors hover:border-accent hover:bg-accent/10"
              >
                <SparklesIcon className="h-3.5 w-3.5" />
                Rellenar para pruebas
              </button>
            </div>

            <div className="grid max-h-44 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 md:max-h-56 xl:max-h-[19rem] xl:grid-cols-3">
              {BANKS.map((b) => {
                const selected = bankId === b.id;
                const texture = textureStyle(b);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBankId(b.id)}
                    aria-pressed={selected}
                    title={b.name}
                    className={`relative aspect-[8/5] overflow-hidden rounded-lg text-left transition-all ${
                      selected
                        ? "ring-2 ring-accent ring-offset-2 ring-offset-[var(--color-surface)]"
                        : "ring-1 ring-border hover:ring-accent/60"
                    }`}
                  >
                    <span className="absolute inset-0" style={{ background: b.gradient }} />
                    {texture && <span className="absolute inset-0" style={texture} />}
                    {b.accent && (
                      <span
                        className="absolute left-1.5 top-1.5 h-1 w-5 rounded-full"
                        style={{ background: b.accent }}
                      />
                    )}
                    <span
                      className={`absolute bottom-1 left-1.5 right-1 line-clamp-2 text-[9px] font-bold leading-tight ${
                        b.text === "dark" ? "text-neutral-800" : "text-white"
                      }`}
                    >
                      {b.name}
                    </span>
                  </button>
                );
              })}
            </div>

            </div>

            <div className="mt-4 xl:mt-0">
              <CardPreview
                name={form.name}
                number={form.number}
                expiry={form.expiry}
                cvc={form.cvc}
                brand={brand}
                bank={bank}
                flipped={flipped}
              />
            </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 flex min-w-0 flex-col gap-4 md:mt-0">
              <label className="flex flex-col gap-1 text-sm text-text-secondary">
                Nombre en la tarjeta
                <input
                  ref={nameRef}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  onFocus={() => setFlipped(false)}
                  placeholder="Bruce Wayne"
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-text focus:border-accent focus:outline-none"
                />
                {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
              </label>

              <label className="flex flex-col gap-1 text-sm text-text-secondary">
                Número de tarjeta
                <span className="relative block">
                  <input
                    inputMode="numeric"
                    value={form.number}
                    onChange={(e) => setForm((f) => ({ ...f, number: formatNumber(e.target.value) }))}
                    onFocus={() => setFlipped(false)}
                    placeholder="4242 4242 4242 4242"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 pr-12 tabular-nums text-text focus:border-accent focus:outline-none"
                  />
                  {brand !== "Tarjeta" && (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      <BrandMark brand={brand} tone="auto" />
                    </span>
                  )}
                </span>
                {errors.number && <span className="text-xs text-red-500">{errors.number}</span>}
              </label>

              <div className="flex gap-3">
                <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm text-text-secondary">
                  Vencimiento
                  <input
                    inputMode="numeric"
                    value={form.expiry}
                    onChange={(e) => setForm((f) => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                    onFocus={() => setFlipped(false)}
                    placeholder="MM/AA"
                    className="w-full min-w-0 rounded-lg border border-border bg-surface px-3 py-2 tabular-nums text-text focus:border-accent focus:outline-none"
                  />
                  {errors.expiry && <span className="text-xs text-red-500">{errors.expiry}</span>}
                </label>
                <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm text-text-secondary">
                  CVC
                  <input
                    inputMode="numeric"
                    value={form.cvc}
                    onChange={(e) => setForm((f) => ({ ...f, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                    onFocus={() => setFlipped(true)}
                    onBlur={() => setFlipped(false)}
                    placeholder={brand === "Amex" ? "1234" : "123"}
                    className="w-full min-w-0 rounded-lg border border-border bg-surface px-3 py-2 tabular-nums text-text focus:border-accent focus:outline-none"
                  />
                  {errors.cvc && <span className="text-xs text-red-500">{errors.cvc}</span>}
                </label>
              </div>

              <label className="flex items-center gap-2 text-xs text-text-secondary">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-border accent-[var(--color-accent)]"
                />
                Guardar esta tarjeta para la próxima vez
              </label>

              <button
                type="submit"
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-nebula px-5 py-3 text-sm font-semibold text-ink shadow-pop transition-all hover:brightness-110 active:scale-95"
              >
                Pagar ${Number(price).toFixed(2)}
              </button>
            </form>
            </div>
          </>
        )}

        {step === "wallet" && wallet && (
          <div className="flex flex-col items-center gap-4 py-8 text-center animate-scale-in">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
              <FingerprintIcon className="h-8 w-8 animate-pulse" />
            </span>
            <div>
              <p className="font-semibold text-text">
                Confirma con {wallet === "apple" ? "Face ID" : wallet === "samsung" ? "tu PIN" : "tu huella"}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Autorizando el pago con {WALLETS.find((w) => w.id === wallet)?.label}...
              </p>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center gap-4 py-10 text-center animate-scale-in">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
            <p className="text-sm text-text-secondary">Procesando pago...</p>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center animate-scale-in">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-nebula text-ink shadow-pop">
              <CheckCircleIcon className="h-7 w-7" />
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
    </div>,
    document.body
  );
}

function CardPreview({
  name,
  number,
  expiry,
  cvc,
  brand,
  bank,
  flipped,
}: {
  name: string;
  number: string;
  expiry: string;
  cvc: string;
  brand: string;
  bank: Bank;
  flipped: boolean;
}) {
  const darkInk = bank.text === "dark";
  const ink = darkInk ? "text-neutral-900" : "text-white";
  const texture = textureStyle(bank);
  const isAmex = brand === "Amex";

  return (
    <div className="[perspective:1000px]">
      <div
        className="relative h-48 w-full transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        <div className={`absolute inset-0 overflow-hidden rounded-2xl shadow-card [backface-visibility:hidden] ${ink}`}>
          <div
            className="absolute inset-0 transition-[background] duration-500"
            style={{ background: bank.gradient }}
          />
          {texture && <div className="absolute inset-0 transition-opacity duration-500" style={texture} />}
          {/* Glossy sheen so flat gradients read as plastic/metal. */}
          <div
            className={`absolute inset-0 ${
              darkInk
                ? "bg-[radial-gradient(circle_at_25%_-20%,rgba(255,255,255,0.65),transparent_55%)]"
                : "bg-[radial-gradient(circle_at_25%_-20%,rgba(255,255,255,0.16),transparent_55%)]"
            }`}
          />

          <div className="relative flex h-full flex-col justify-between p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wide opacity-90">{bank.name}</span>
                {bank.accent && (
                  <span className="mt-1 block h-1 w-7 rounded-full" style={{ background: bank.accent }} />
                )}
              </div>
              {brand === "Tarjeta" ? (
                <span className="text-xs font-semibold uppercase tracking-wide opacity-60">Débito/Crédito</span>
              ) : (
                <BrandMark brand={brand} tone={darkInk ? "dark" : "light"} />
              )}
            </div>

            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="h-6 w-8 shrink-0 rounded-md border border-black/20 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 opacity-90"
              />
              <p className="text-base font-semibold tabular-nums tracking-[0.14em] sm:text-lg sm:tracking-widest">
                {number || (isAmex ? "•••• •••••• •••••" : "•••• •••• •••• ••••")}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="max-w-[60%] truncate uppercase opacity-90">{name || "NOMBRE APELLIDO"}</span>
              <span className="tabular-nums opacity-90">{expiry || "MM/AA"}</span>
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 flex flex-col justify-center gap-2 overflow-hidden rounded-2xl bg-[#221e2c] p-5 text-white [backface-visibility:hidden]"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="h-9 w-full bg-black/60" />
          <div className="flex items-center justify-end gap-2">
            {bank.accent && <span className="h-1.5 w-10 rounded-full" style={{ background: bank.accent }} />}
            <span className="rounded bg-white px-3 py-1 text-sm font-semibold tracking-widest text-[#221e2c]">
              {cvc || (isAmex ? "••••" : "•••")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
