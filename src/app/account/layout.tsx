import { requireUser } from "@/lib/auth";
import { AccountTabs } from "@/components/AccountTabs";
import { BackButton } from "@/components/BackButton";
import { UserIcon } from "@/components/icons";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-10 animate-fade-up">
      <BackButton fallback="/" label="Volver al catálogo" className="mb-6" />

      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-nebula text-ink shadow-pop">
          <UserIcon className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">Mi cuenta</h1>
          <p className="text-sm text-text-secondary">Perfil, seguridad y métodos de pago en un solo lugar.</p>
        </div>
      </div>

      <div className="mt-6">
        <AccountTabs />
      </div>

      <div className="mt-8 rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-8">{children}</div>
    </div>
  );
}
