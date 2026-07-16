"use client";

import { scorePassword } from "@/lib/passwordStrength";

const BAR_COLORS = ["bg-red-400", "bg-orange-400", "bg-amber-400", "bg-accent-tertiary", "bg-emerald-500"];

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const { score, label, suggestions } = scorePassword(password);

  return (
    <div className="-mt-1 flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i <= score - 1 ? BAR_COLORS[score] : "bg-border"}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span>{label}</span>
        {suggestions[0] && <span>{suggestions[0]}</span>}
      </div>
    </div>
  );
}
