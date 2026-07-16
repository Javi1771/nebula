import Link from "next/link";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { StatTile } from "@/components/StatTile";
import type { Purchase } from "@/lib/types";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [{ count: totalUsers }] = await sql<{ count: string }[]>`
    select count(*)::text from users
  `;
  const [{ count: totalMovies }] = await sql<{ count: string }[]>`
    select count(*)::text from movies
  `;
  const [{ count: totalSales, revenue }] = await sql<
    { count: string; revenue: string }[]
  >`
    select count(*)::text, coalesce(sum(price), 0)::text as revenue from purchases
  `;

  const recentSales = await sql<
    (Purchase & { movie_title: string; user_email: string })[]
  >`
    select p.*, m.title as movie_title, u.email as user_email
    from purchases p
    join movies m on m.id = p.movie_id
    join users u on u.id = p.user_id
    order by p.created_at desc
    limit 10
  `;

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-text">Panel de administración</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin/movies" className="font-medium text-accent hover:underline">
            Películas
          </Link>
          <Link href="/admin/users" className="font-medium text-accent hover:underline">
            Usuarios
          </Link>
        </nav>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Usuarios" value={totalUsers} />
        <StatTile label="Películas" value={totalMovies} />
        <StatTile label="Transacciones" value={totalSales} />
        <StatTile label="Ingresos" value={`$${Number(revenue).toFixed(2)}`} accent />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-text">Ventas recientes</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-text-secondary">
              <tr>
                <th className="px-4 py-3">Película</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale) => (
                <tr key={sale.id} className="border-t border-border">
                  <td className="px-4 py-3 text-text">{sale.movie_title}</td>
                  <td className="px-4 py-3 text-text-secondary">{sale.user_email}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {sale.type === "buy" ? "Compra" : "Renta"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    ${Number(sale.price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {new Date(sale.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {recentSales.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-text-secondary">
                    Sin transacciones todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
