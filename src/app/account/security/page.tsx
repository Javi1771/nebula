import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export default function AccountSecurityPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text">Cambiar contraseña</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Necesitas confirmar tu contraseña actual para establecer una nueva.
      </p>
      <div className="mt-6">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
