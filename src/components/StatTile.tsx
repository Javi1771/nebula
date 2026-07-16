export function StatTile({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-border p-5 shadow-card transition-transform duration-300 hover:-translate-y-0.5 ${
        accent ? "bg-gradient-nebula text-white" : "bg-surface"
      }`}
    >
      <p
        className={`text-xs font-medium uppercase tracking-wide ${
          accent ? "text-white/75" : "text-text-secondary"
        }`}
      >
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
}
