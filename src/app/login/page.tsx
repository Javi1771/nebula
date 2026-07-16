"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { AuthLayout } from "@/components/AuthLayout";
import { EmailField } from "@/components/EmailField";
import { PasswordInput } from "@/components/PasswordInput";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo iniciar sesión");
      }
      toast.success("Bienvenido de nuevo");
      router.push(next);
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
      title="Iniciar sesión"
      subtitle="Entra para comprar, rentar y armar tu biblioteca."
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-accent hover:underline">
            Regístrate
          </Link>
        </>
      }
    >
      <div className="mb-5 rounded-2xl border border-border bg-surface p-4 text-xs text-text-secondary shadow-card">
        <p className="font-semibold text-text">Credenciales de demo</p>
        <p className="mt-1 tabular-nums">Admin: admin@demo.com / admin1234</p>
        <p className="tabular-nums">Usuario: user@demo.com / user1234</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-text-secondary" htmlFor="email">
          Email
          <EmailField id="email" value={email} onChange={setEmail} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-text-secondary" htmlFor="password">
          Contraseña
          <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="current-password" required />
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
