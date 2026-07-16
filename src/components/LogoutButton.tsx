"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

export function LogoutButton({
  className = "text-sm font-medium text-on-dark-soft hover:text-accent-tertiary transition-colors disabled:opacity-50",
  children,
  title,
}: {
  className?: string;
  children?: ReactNode;
  title?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    toast("Sesión cerrada");
    router.push("/");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} disabled={loading} title={title} aria-label={title} className={className}>
      {children ?? (loading ? "Saliendo..." : "Salir")}
    </button>
  );
}
