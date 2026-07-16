"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { PasswordInput } from "@/components/PasswordInput";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (mismatch) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo cambiar la contraseña");
      }
      toast.success("Contraseña actualizada");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm text-text-secondary">
        Contraseña actual
        <PasswordInput value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />
      </label>

      <label className="flex flex-col gap-1 text-sm text-text-secondary">
        Nueva contraseña
        <PasswordInput value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
      </label>
      <PasswordStrengthMeter password={newPassword} />

      <label className="flex flex-col gap-1 text-sm text-text-secondary">
        Confirmar nueva contraseña
        <PasswordInput value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
        {mismatch && <span className="text-xs text-amber-500">Las contraseñas no coinciden</span>}
      </label>

      <Button type="submit" disabled={loading || mismatch} className="self-start">
        {loading ? "Actualizando..." : "Actualizar contraseña"}
      </Button>
    </form>
  );
}
