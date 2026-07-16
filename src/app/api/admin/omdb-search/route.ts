import { NextResponse, type NextRequest } from "next/server";
import { searchOmdb } from "@/lib/omdb";
import { jsonError, withAdmin, withLogging } from "@/lib/api-middleware";

/** GET /api/admin/omdb-search?q=title — admin only. Proxies OMDb search server-side (key never reaches the client). */
export const GET = withLogging(
  withAdmin(async (request: NextRequest) => {
    const q = request.nextUrl.searchParams.get("q")?.trim();
    if (!q) return jsonError(400, "Falta el parámetro q");

    const results = await searchOmdb(q);
    return NextResponse.json({ results });
  })
);
