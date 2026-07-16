"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { AuthLayout } from "@/components/AuthLayout";
import { EmailField } from "@/components/EmailField";
import { PasswordInput } from "@/components/PasswordInput";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo crear la cuenta");
      }
      toast.success("Cuenta creada — bienvenido a Nébula");
      router.push("/");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      formSide="left"
      title="Crear cuenta"
      subtitle="Empiezas con $100.00 de saldo demo para comprar o rentar."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-text-secondary" htmlFor="name">
          Nombre
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-text transition-colors focus:border-accent focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-text-secondary" htmlFor="email">
          Email
          <EmailField id="email" value={email} onChange={setEmail} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-text-secondary" htmlFor="password">
          Contraseña
          <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="new-password" required minLength={6} />
        </label>
        <PasswordStrengthMeter password={password} />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creando..." : "Crear cuenta"}
        </Button>
      </form>
    </AuthLayout>
  );
}
