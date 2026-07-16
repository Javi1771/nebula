import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-dark-surface text-on-dark-soft">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <span className="text-on-dark">
            <Logo size={22} />
          </span>
          <p className="text-sm">Demo técnica — catálogo servido por OMDb, pagos simulados.</p>
        </div>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-accent-tertiary transition-colors">
            Catálogo
          </Link>
          <span aria-hidden className="h-1 w-1 rounded-full bg-accent-secondary/50" />
          <Link href="/library" className="hover:text-accent-tertiary transition-colors">
            Mi biblioteca
          </Link>
          <span aria-hidden className="h-1 w-1 rounded-full bg-accent-secondary/50" />
          <Link href="/admin" className="hover:text-accent-tertiary transition-colors">
            Admin
          </Link>
        </nav>
      </div>
    </footer>
  );
}
