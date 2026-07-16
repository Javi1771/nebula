import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { HeaderNav } from "@/components/HeaderNav";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-dark-surface/95 text-on-dark backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-on-dark">
          <Logo />
        </Link>

        <HeaderNav user={user ? { name: user.name, balance: user.balance, role: user.role } : null} />
      </div>
    </header>
  );
}
