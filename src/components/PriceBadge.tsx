export function PriceBadge({
  label,
  price,
  tone = "primary",
}: {
  label: string;
  price: string | number;
  tone?: "primary" | "secondary";
}) {
  const toneClasses =
    tone === "primary"
      ? "bg-accent/12 text-accent-alt"
      : "bg-accent-tertiary/15 text-accent-tertiary-alt";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${toneClasses}`}
    >
      {label}
      <span className="font-bold">${Number(price).toFixed(2)}</span>
    </span>
  );
}
