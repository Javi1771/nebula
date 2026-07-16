import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { PublicUser } from "@/lib/types";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await sql<PublicUser[]>`
    select id, email, name, role, balance, created_at
    from users
    order by created_at desc
  `;

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10 animate-fade-up">
      <h1 className="text-2xl font-bold tracking-tight text-text">Usuarios</h1>
      <p className="mt-1 text-sm text-text-secondary">Listado de solo lectura.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-text-secondary">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Saldo</th>
              <th className="px-4 py-3">Registrado</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-4 py-3 text-text">{u.name}</td>
                <td className="px-4 py-3 text-text-secondary">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      u.role === "admin"
                        ? "bg-accent/15 text-accent"
                        : "bg-accent-tertiary/15 text-accent-tertiary-alt"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary">${Number(u.balance).toFixed(2)}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
