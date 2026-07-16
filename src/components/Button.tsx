import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "secondary-dark" | "ghost" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-gradient-nebula text-ink shadow-pop hover:brightness-110",
  secondary:
    "bg-transparent border border-border text-text hover:border-accent hover:text-accent",
  // For buttons living on the always-dark hero: theme-aware text-text turns
  // invisible there in light mode, so this variant pins on-dark ink.
  "secondary-dark":
    "border border-white/25 bg-white/10 text-on-dark backdrop-blur hover:border-accent-tertiary hover:text-accent-tertiary",
  ghost: "bg-transparent text-text-secondary hover:text-accent",
  danger:
    "bg-transparent border border-red-400/40 text-red-500 hover:bg-red-500/10",
};

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface ButtonLinkProps {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
