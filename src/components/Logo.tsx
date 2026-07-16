"use client";

import { useId } from "react";

/**
 * The bare gradient orb — violet core fading to magenta, with two faint star
 * flecks. Used inline next to the wordmark. No bounding tile, so it reads
 * light at small sizes (header, footer).
 */
export function NebulaOrb({ size = 26 }: { size?: number }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <radialGradient id={`${id}-core`} cx="38%" cy="34%" r="75%">
          <stop offset="0%" stopColor="#B9A8FF" />
          <stop offset="45%" stopColor="#6C4CF5" />
          <stop offset="100%" stopColor="#E94E92" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill={`url(#${id}-core)`} />
      <circle cx="23.5" cy="9.5" r="1.4" fill="#fff" opacity="0.9" />
      <circle cx="10" cy="22" r="0.9" fill="#fff" opacity="0.6" />
    </svg>
  );
}

/**
 * The self-contained app badge — dark tile + orb + flecks. Used for the
 * favicon/app-icon renderers and anywhere the mark needs to stand alone.
 */
export function NebulaGlyph({ size = 64 }: { size?: number }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <radialGradient id={`${id}-core`} cx="38%" cy="34%" r="75%">
          <stop offset="0%" stopColor="#C4B6FF" />
          <stop offset="45%" stopColor="#6C4CF5" />
          <stop offset="100%" stopColor="#E94E92" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="64" height="64" rx="16" fill="#14121C" />
      <circle cx="32" cy="32" r="19" fill={`url(#${id}-core)`} />
      <circle cx="45" cy="19" r="2.6" fill="#fff" opacity="0.9" />
      <circle cx="19" cy="43" r="1.6" fill="#fff" opacity="0.55" />
    </svg>
  );
}

/** Orb + wordmark. Inherits text color from its container (`currentColor`). */
export function Logo({ size = 26, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <NebulaOrb size={size} />
      <span className="text-lg font-semibold tracking-tight lowercase">nebula</span>
    </span>
  );
}
