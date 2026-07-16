import { requireAdmin } from "@/lib/auth";
import { AdminMoviesClient } from "@/components/AdminMoviesClient";

export default async function AdminMoviesPage() {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10 animate-fade-up">
      <h1 className="text-2xl font-bold tracking-tight text-text">Gestión de películas</h1>
      <AdminMoviesClient />
    </div>
  );
}
