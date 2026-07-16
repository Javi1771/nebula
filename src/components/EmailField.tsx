"use client";

import { useState } from "react";
import { MailWarnIcon } from "@/components/icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EmailFieldProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

/** On-blur, not on-keystroke — the hint should feel like a nudge, not a scold. */
export function EmailField({ value, onChange, id }: EmailFieldProps) {
  const [touched, setTouched] = useState(false);
  const showHint = touched && value.length > 0 && !EMAIL_RE.test(value);

  return (
    <div>
      <input
        id={id}
        type="email"
        required
        autoComplete="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        onFocus={() => setTouched(false)}
        className={`w-full rounded-lg border bg-surface px-3 py-2 text-text transition-colors focus:outline-none ${
          showHint ? "border-amber-400/60 focus:border-amber-400" : "border-border focus:border-accent"
        }`}
      />
      {showHint && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-500">
          <MailWarnIcon className="h-3.5 w-3.5" />
          ¿Escribiste bien tu correo? Falta algo como &quot;@dominio.com&quot;
        </p>
      )}
    </div>
  );
}
