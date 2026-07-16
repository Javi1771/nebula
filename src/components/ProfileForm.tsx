"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { Avatar } from "@/components/Avatar";
import { CameraIcon, CloseIcon } from "@/components/icons";

interface ProfileFormProps {
  name: string;
  email: string;
  avatarUrl: string | null;
  balance: string;
}

const AVATAR_SIZE = 320;
const MAX_FILE_MB = 8;

/**
 * Square-crops and downscales the chosen image in the browser, so what travels
 * to the API (and lives in Neon's avatar_url column) is a small base64 JPEG,
 * never the original multi-MB file.
 */
async function fileToAvatarDataUrl(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("No se pudo leer la imagen"));
      el.src = objectUrl;
    });

    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - side) / 2;
    const sy = (img.naturalHeight - side) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = AVATAR_SIZE;
    canvas.height = AVATAR_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo procesar la imagen");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);

    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function ProfileForm({ name: initialName, email, avatarUrl: initialAvatar, balance }: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatar);
  const [avatarDirty, setAvatarDirty] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`La imagen no debe superar ${MAX_FILE_MB} MB`);
      return;
    }
    setProcessing(true);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setAvatarUrl(dataUrl);
      setAvatarDirty(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo procesar la imagen");
    } finally {
      setProcessing(false);
    }
  }

  function removeAvatar() {
    setAvatarUrl(null);
    setAvatarDirty(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: { name: string; avatarUrl?: string | null } = { name };
      if (avatarDirty) payload.avatarUrl = avatarUrl;

      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo actualizar el perfil");
      }
      setAvatarDirty(false);
      toast.success("Perfil actualizado");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-background/60 p-6 sm:flex-row sm:items-center">
        <div className="group relative">
          <Avatar name={name || email} avatarUrl={avatarUrl} size={96} />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
            aria-label="Cambiar foto de perfil"
            className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-nebula text-ink shadow-pop transition-transform hover:scale-110 active:scale-95 disabled:opacity-60"
          >
            <CameraIcon className="h-4 w-4" />
          </button>

          {avatarUrl && (
            <button
              type="button"
              onClick={removeAvatar}
              aria-label="Quitar foto de perfil"
              title="Quitar foto"
              className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-text-secondary shadow-card transition-all hover:text-accent-secondary"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
          />
        </div>

        <div className="text-center sm:text-left">
          <p className="text-lg font-semibold text-text">{name || "Sin nombre"}</p>
          <p className="text-sm text-text-secondary">{email}</p>
          <p className="mt-1.5 text-xs text-text-secondary">
            Saldo: <span className="font-semibold text-accent-alt">${Number(balance).toFixed(2)}</span>
          </p>
          <p className="mt-2 text-xs text-text-secondary">
            {processing
              ? "Procesando imagen..."
              : "PNG, JPG o WebP · máx. 8 MB. Se recorta al centro y se guarda en tu cuenta."}
          </p>
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm text-text-secondary">
        Nombre
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-text transition-colors focus:border-accent focus:outline-none"
        />
      </label>

      <Button type="submit" disabled={loading || processing} className="self-start">
        {loading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
