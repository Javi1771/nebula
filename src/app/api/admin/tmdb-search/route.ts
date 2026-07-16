import { NextResponse, type NextRequest } from "next/server";
import { searchMulti } from "@/lib/tmdb";
import { jsonError, withAdmin, withLogging } from "@/lib/api-middleware";

/** GET /api/admin/tmdb-search?q=title — admin only. Proxies TMDB multi-search server-side (token never reaches the client). */
export const GET = withLogging(
  withAdmin(async (request: NextRequest) => {
    const q = request.nextUrl.searchParams.get("q")?.trim();
    if (!q) return jsonError(400, "Falta el parámetro q");

    const results = await searchMulti(q);
    return NextResponse.json({ results });
  })
);
