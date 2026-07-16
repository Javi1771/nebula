import React from "react";

// Símbolo: dos bloques redondeados (tinta + verde acento).
// tone="auto" sigue el tema (tinta en claro, gris-perla en oscuro vía --logo-ink);
// tone="onDark" fuerza la variante clara para superficies siempre oscuras (sidebar/topbar).
export function LogoSymbol({ size = 48, tone = "auto" }: { size?: number; tone?: "auto" | "onDark" }) {
  const ink = tone === "onDark" ? "#c8d2d7" : "var(--logo-ink, #0f2d3c)";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="30" height="30" rx="8" fill={ink} />
      <rect x="18" y="18" width="30" height="30" rx="8" fill="#1ebe91" />
    </svg>
  );
}

// Logo completo - modo claro (texto oscuro)
export function LogoLight({ name = "Nébula", width = 220 }: { name?: string; width?: number }) {
  return (
    <svg width={width} height={(width * 48) / 220} viewBox="0 0 220 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="30" height="30" rx="8" fill="#0f2d3c" />
      <rect x="18" y="18" width="30" height="30" rx="8" fill="#1ebe91" />
      <text x="62" y="32" fontFamily="Helvetica, Arial, sans-serif" fontWeight="700" fontSize="26" letterSpacing="-0.5" fill="#0f2d3c">
        {name}
      </text>
    </svg>
  );
}

// Logo completo - modo oscuro (texto claro)
export function LogoDark({ name = "Nébula", width = 220 }: { name?: string; width?: number }) {
  return (
    <svg width={width} height={(width * 48) / 220} viewBox="0 0 220 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="30" height="30" rx="8" fill="#c8d2d7" />
      <rect x="18" y="18" width="30" height="30" rx="8" fill="#1ebe91" />
      <text x="62" y="32" fontFamily="Helvetica, Arial, sans-serif" fontWeight="700" fontSize="26" letterSpacing="-0.5" fill="#c8d2d7">
        {name}
      </text>
    </svg>
  );
}

// Símbolo con fondo (app icon / favicon)
export function LogoAppIcon({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="64" height="64" rx="16" fill="#0f2d3c" />
      <rect x="14" y="14" width="24" height="24" rx="6" fill="#1ebe91" />
      <rect x="26" y="26" width="24" height="24" rx="6" fill="#69d7b9" />
    </svg>
  );
}
