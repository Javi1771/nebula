/** Soft nebula-gradient block standing in for a missing poster image. */
export function PlaceholderArt({ className = "" }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Sin imagen disponible"
      className={`placeholder-art rounded-lg ${className}`}
    />
  );
}
