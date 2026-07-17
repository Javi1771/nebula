import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AppToaster } from "@/components/AppToaster";
import { AppShell } from "@/components/AppShell";
import { NavTracker } from "@/components/NavTracker";
import { getCurrentUser } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Nébula — Compra y renta películas y series",
  description: "Catálogo de películas y series con compra, renta y pago simulado — prueba técnica.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  const theme = cookieStore.get("nebula-theme")?.value === "dark" ? "dark" : "light";

  return (
    <html
      lang="es"
      data-theme={theme}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppShell
          user={
            user
              ? {
                  name: user.name,
                  email: user.email,
                  balance: user.balance,
                  role: user.role,
                  avatarUrl: user.avatar_url,
                }
              : null
          }
          initialTheme={theme}
        >
          {children}
        </AppShell>
        <AppToaster />
        <Suspense fallback={null}>
          <NavTracker />
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
