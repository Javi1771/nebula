"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CardIcon, LockIcon, UserIcon } from "@/components/icons";

const TABS = [
  { href: "/account", label: "Perfil", icon: UserIcon },
  { href: "/account/security", label: "Seguridad", icon: LockIcon },
  { href: "/account/payment-methods", label: "Métodos de pago", icon: CardIcon },
];

export function AccountTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-full border border-border bg-surface p-1">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              active ? "bg-gradient-nebula text-ink shadow-pop" : "text-text-secondary hover:text-accent"
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
