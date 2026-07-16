"use client";

import Image from "next/image";
import { startTransition, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import type { Movie } from "@/lib/types";

interface OmdbSearchResult {
  Title: string;
  Year: string;
  imdbID: string;
  Poster: string;
}

export function AdminMoviesClient() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [movieSearch, setMovieSearch] = useState("");
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [moviesError, setMoviesError] = useState<string | null>(null);

  const [omdbQuery, setOmdbQuery] = useState("");
  const [omdbResults, setOmdbResults] = useState<OmdbSearchResult[]>([]);
  const [omdbLoading, setOmdbLoading] = useState(false);
  const [omdbError, setOmdbError] = useState<string | null>(null);

  const [importing, setImporting] = useState<{
    imdbId: string;
    title: string;
    priceBuy: string;
    priceRent: string;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  const [edits, setEdits] = useState<
    Record<string, { priceBuy: string; priceRent: string; saving: boolean }>
  >({});
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  async function loadMovies() {
    setMoviesLoading(true);
    setMoviesError(null);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (movieSearch) params.set("search", movieSearch);
      const res = await fetch(`/api/movies?${params.toString()}`);
      if (!res.ok) throw new Error("No se pudo cargar el catálogo");
      const data = await res.json();
      setMovies(data.items);
      const nextEdits: typeof edits = {};
      for (const m of data.items as Movie[]) {
        nextEdits[m.id] = {
          priceBuy: m.price_buy,
          priceRent: m.price_rent,
          saving: false,
        };
      }
      setEdits(nextEdits);
    } catch {
      setMoviesError("No se pudo cargar el catálogo.");
    } finally {
      setMoviesLoading(false);
    }
  }

  useEffect(() => {
    startTransition(() => {
      loadMovies();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieSearch]);

  async function handleOmdbSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!omdbQuery.trim()) return;
    setOmdbLoading(true);
    setOmdbError(null);
    try {
      const res = await fetch(`/api/admin/omdb-search?q=${encodeURIComponent(omdbQuery)}`);
      if (!res.ok) throw new Error("Búsqueda fallida");
      const data = await res.json();
      setOmdbResults(data.results ?? []);
    } catch {
      setOmdbError("No se pudo buscar en OMDb.");
    } finally {
      setOmdbLoading(false);
    }
  }

  async function confirmImport() {
    if (!importing) return;
    setImportLoading(true);
    setImportError(null);
    try {
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imdbId: importing.imdbId,
          priceBuy: Number(importing.priceBuy),
          priceRent: Number(importing.priceRent),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo importar");
      }
      setImporting(null);
      await loadMovies();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setImportLoading(false);
    }
  }

  async function saveMovie(id: string) {
    const edit = edits[id];
    if (!edit) return;
    setEdits((prev) => ({ ...prev, [id]: { ...edit, saving: true } }));
    try {
      const res = await fetch(`/api/movies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceBuy: Number(edit.priceBuy),
          priceRent: Number(edit.priceRent),
        }),
      });
      if (!res.ok) throw new Error("No se pudo actualizar");
      await loadMovies();
    } catch {
      setMoviesError("No se pudo guardar el cambio de precio.");
    } finally {
      setEdits((prev) => ({ ...prev, [id]: { ...edit, saving: false } }));
    }
  }

  async function deleteMovie(id: string) {
    await fetch(`/api/movies/${id}`, { method: "DELETE" });
    setConfirmingDelete(null);
    await loadMovies();
  }

  return (
    <div className="mt-6 flex flex-col gap-10">
      <section>
        <h2 className="text-lg font-semibold text-text">Agregar película (OMDb)</h2>
        <form onSubmit={handleOmdbSearch} className="mt-3 flex gap-2">
          <input
            value={omdbQuery}
            onChange={(e) => setOmdbQuery(e.target.value)}
            placeholder="Buscar título en OMDb..."
            className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
          />
          <Button type="submit" disabled={omdbLoading}>
            {omdbLoading ? "Buscando..." : "Buscar"}
          </Button>
        </form>
        {omdbError && <p className="mt-2 text-sm text-red-500">{omdbError}</p>}

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {omdbResults.map((r) => (
            <div key={r.imdbID} className="rounded-xl border border-border bg-surface p-3">
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded">
                {r.Poster !== "N/A" && (
                  <Image
                    src={r.Poster}
                    alt={r.Title}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover"
                  />
                )}
              </div>
              <p className="mt-2 line-clamp-1 text-sm font-semibold text-text">{r.Title}</p>
              <p className="text-xs text-text-secondary">{r.Year}</p>
              <Button
                variant="secondary"
                className="mt-2 w-full"
                onClick={() =>
                  setImporting({
                    imdbId: r.imdbID,
                    title: r.Title,
                    priceBuy: "12.99",
                    priceRent: "3.99",
                  })
                }
              >
                Importar
              </Button>
            </div>
          ))}
        </div>

        {importing && (
          <div className="mt-4 max-w-sm rounded-lg border border-accent bg-surface p-4">
            <p className="text-sm font-semibold text-text">Importar: {importing.title}</p>
            <div className="mt-3 flex gap-3">
              <label className="flex flex-1 flex-col gap-1 text-xs text-text-secondary">
                Precio compra
                <input
                  type="number"
                  step="0.01"
                  value={importing.priceBuy}
                  onChange={(e) => setImporting({ ...importing, priceBuy: e.target.value })}
                  className="rounded-xl border border-border bg-surface px-2 py-1.5 text-sm text-text"
                />
              </label>
              <label className="flex flex-1 flex-col gap-1 text-xs text-text-secondary">
                Precio renta
                <input
                  type="number"
                  step="0.01"
                  value={importing.priceRent}
                  onChange={(e) => setImporting({ ...importing, priceRent: e.target.value })}
                  className="rounded-xl border border-border bg-surface px-2 py-1.5 text-sm text-text"
                />
              </label>
            </div>
            {importError && <p className="mt-2 text-sm text-red-500">{importError}</p>}
            <div className="mt-3 flex gap-2">
              <Button onClick={confirmImport} disabled={importLoading}>
                {importLoading ? "Importando..." : "Confirmar"}
              </Button>
              <Button variant="ghost" onClick={() => setImporting(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Catálogo actual</h2>
          <input
            value={movieSearch}
            onChange={(e) => setMovieSearch(e.target.value)}
            placeholder="Buscar..."
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-text focus:border-accent focus:outline-none"
          />
        </div>

        {moviesError && <p className="mt-2 text-sm text-red-500">{moviesError}</p>}

        <div className="mt-4 overflow-x-auto rounded-2xl border border-border shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-text-secondary">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Género</th>
                <th className="px-4 py-3">Compra</th>
                <th className="px-4 py-3">Renta</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((m) => {
                const edit = edits[m.id];
                return (
                  <tr key={m.id} className="border-t border-border">
                    <td className="px-4 py-3 text-text">{m.title}</td>
                    <td className="px-4 py-3 text-text-secondary">{m.genre ?? "—"}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={edit?.priceBuy ?? ""}
                        onChange={(e) =>
                          setEdits((prev) => ({
                            ...prev,
                            [m.id]: { ...prev[m.id], priceBuy: e.target.value },
                          }))
                        }
                        className="w-20 rounded border border-border bg-surface px-2 py-1 text-text"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={edit?.priceRent ?? ""}
                        onChange={(e) =>
                          setEdits((prev) => ({
                            ...prev,
                            [m.id]: { ...prev[m.id], priceRent: e.target.value },
                          }))
                        }
                        className="w-20 rounded border border-border bg-surface px-2 py-1 text-text"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => saveMovie(m.id)}
                          disabled={edit?.saving}
                        >
                          {edit?.saving ? "..." : "Guardar"}
                        </Button>
                        {confirmingDelete === m.id ? (
                          <>
                            <Button variant="danger" onClick={() => deleteMovie(m.id)}>
                              Confirmar
                            </Button>
                            <Button variant="ghost" onClick={() => setConfirmingDelete(null)}>
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <Button variant="danger" onClick={() => setConfirmingDelete(m.id)}>
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!moviesLoading && movies.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-text-secondary">
                    Sin películas en el catálogo.
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
