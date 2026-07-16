import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "@/lib/session";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

const AUTH_ONLY_ROUTES = ["/library"];
const ADMIN_ONLY_PREFIX = "/admin";
const GUEST_ONLY_ROUTES = ["/login", "/register"];

// Next.js 16 network-boundary layer: page-level route protection.
// API routes enforce their own auth via withAuth/withAdmin (src/lib/api-middleware.ts),
// since this proxy's matcher below excludes /api/*.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySession(token);

  const isAdminRoute = pathname.startsWith(ADMIN_ONLY_PREFIX);
  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isGuestOnlyRoute = GUEST_ONLY_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if ((isAdminRoute || isAuthOnlyRoute) && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && session?.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isGuestOnlyRoute && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
