import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import type { SessionPayload } from "@/lib/types";

export function jsonError(status: number, message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

type RouteContext = { params?: Promise<Record<string, string>> };

type Handler<C extends RouteContext> = (
  request: NextRequest,
  context: C
) => Promise<Response> | Response;

type AuthedHandler<C extends RouteContext> = (
  request: NextRequest,
  context: C,
  user: SessionPayload
) => Promise<Response> | Response;

/** API-layer middleware: rejects the request with 401 unless a valid session cookie is present. */
export function withAuth<C extends RouteContext = RouteContext>(
  handler: AuthedHandler<C>
) {
  return async (request: NextRequest, context: C) => {
    const session = await getSession();
    if (!session) {
      return jsonError(401, "No autenticado");
    }
    return handler(request, context, session);
  };
}

/** API-layer middleware: rejects with 401/403 unless the caller is an authenticated admin. */
export function withAdmin<C extends RouteContext = RouteContext>(
  handler: AuthedHandler<C>
) {
  return withAuth<C>((request, context, user) => {
    if (user.role !== "admin") {
      return jsonError(403, "Requiere rol de administrador");
    }
    return handler(request, context, user);
  });
}

/** API-layer middleware: logs method/path/status/duration for every request — composes with withAuth/withAdmin. */
export function withLogging<C extends RouteContext = RouteContext>(
  handler: Handler<C>
) {
  return async (request: NextRequest, context: C) => {
    const start = Date.now();
    const response = await handler(request, context);
    const ms = Date.now() - start;
    console.log(
      `[api] ${request.method} ${request.nextUrl.pathname} -> ${response.status} (${ms}ms)`
    );
    return response;
  };
}
