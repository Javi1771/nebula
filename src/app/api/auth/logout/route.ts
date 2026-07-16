import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";
import { withLogging } from "@/lib/api-middleware";

export const POST = withLogging(async () => {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
});
