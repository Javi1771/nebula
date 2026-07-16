export function StarIcon({ className = "h-3 w-3 text-accent-tertiary" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M10 1.6l2.47 5.4 5.93.63-4.46 4.02 1.27 5.85L10 14.6l-5.21 2.9 1.27-5.85L1.6 7.63l5.93-.63L10 1.6Z" />
    </svg>
  );
}
