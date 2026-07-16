/** Small hand-drawn icon set in a Material-Symbols-like idiom: geometric, rounded, minimal. */

type IconProps = { className?: string };

export function PlayIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M8 5.14v13.72c0 .8.87 1.29 1.55.87l10.98-6.86a1 1 0 0 0 0-1.74L9.55 4.27C8.87 3.85 8 4.34 8 5.14Z" />
    </svg>
  );
}

export function TvIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 21h6M12 17v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function FilmIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8 4v16M16 4v16M3 9h5M16 9h5M3 15h5M16 15h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CalendarIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronRightIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function QuoteIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M7.5 6C4.9 6 3 8.1 3 10.7c0 2.4 1.7 4.3 4 4.3.3 0 .6 0 .8-.1C7.2 17.4 5.8 19 3.6 19.6l.6 1.7c3.9-.9 6.3-4 6.3-8.2C10.5 8.7 9.3 6 7.5 6Zm10 0c-2.6 0-4.5 2.1-4.5 4.7 0 2.4 1.7 4.3 4 4.3.3 0 .6 0 .8-.1-.6 2.5-2 4.1-4.2 4.7l.6 1.7c3.9-.9 6.3-4 6.3-8.2C20.5 8.7 19.3 6 17.5 6Z" />
    </svg>
  );
}

export function CheckCircleIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="m8 12.5 2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FingerprintIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3a7 7 0 0 0-7 7v2c0 3 1 5 1 5M12 3a7 7 0 0 1 7 7v3M8 21c-1-1.5-2-3.5-2-6v-2a6 6 0 0 1 12 0v1M9 21c-.6-1-1-2.5-1-4v-3a4 4 0 0 1 8 0v3c0 .7-.1 1.4-.3 2M12 12v4c0 1 .2 2 .6 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** The real multicolor Google "G" mark, used only for the Google Pay button. */
export function GoogleGIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M45.1 24.5c0-1.6-.1-3.1-.4-4.6H24v9h11.8c-.5 2.7-2.1 5-4.4 6.6v5.5h7.1c4.2-3.9 6.6-9.6 6.6-16.5Z"
      />
      <path
        fill="#34A853"
        d="M24 46c6 0 11-2 14.6-5.3l-7.1-5.5c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.6-3.9-12.4-9.1H4.3v5.7A22 22 0 0 0 24 46Z"
      />
      <path fill="#FBBC05" d="M11.6 28.2a13.2 13.2 0 0 1 0-8.4v-5.7H4.3a22 22 0 0 0 0 19.8l7.3-5.7Z" />
      <path
        fill="#EA4335"
        d="M24 10.7c3.3 0 6.2 1.1 8.5 3.3l6.3-6.3C34.9 4.2 30 2 24 2 15.5 2 8.2 6.9 4.3 14.1l7.3 5.7C13.4 14.6 18.2 10.7 24 10.7Z"
      />
    </svg>
  );
}

export function AppleLogoIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.4 1c.1 1.2-.4 2.4-1.1 3.3-.7.9-1.9 1.6-3 1.5-.1-1.2.4-2.5 1.1-3.3.8-.9 2.1-1.5 3-1.5ZM19.9 17.4c-.5 1.1-.7 1.6-1.4 2.6-.9 1.4-2.2 3.1-3.8 3.1-1.4 0-1.8-.9-3.7-.9-1.9 0-2.4.9-3.7.9-1.6 0-2.8-1.6-3.7-2.9-2.5-3.7-2.8-8-1.2-10.3 1.1-1.6 2.9-2.6 4.6-2.6 1.7 0 2.8 1 4.2 1 1.4 0 2.2-1 4.2-1 1.5 0 3.1.8 4.2 2.2-3.7 2-3.1 7.3.3 7.9Z" />
    </svg>
  );
}

export function SamsungPayIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 15c1.5 1 4 1 5-.3.9-1.3-.4-2-2-2.4-1.6-.4-2.8-1-2-2.4C7.9 8.7 10.4 8.7 12 9.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 15.5 16.5 8.5 19 15.5M14.9 13h3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CardIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.5 9.5h19" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function HeartIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 20.3 4.6 13c-2-2-2-5.2 0-7.1 2-2 5.1-2 7 0l.4.4.4-.4c2-2 5.1-2 7 0 2 2 2 5.2 0 7.1L12 20.3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HomeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="m4 11 8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ClockIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UserIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function LockIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function EyeIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function EyeOffIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M3.5 3.5l17 17M9.9 5.7C10.6 5.6 11.3 5.5 12 5.5c6.5 0 10 6.5 10 6.5a15.6 15.6 0 0 1-3.4 4.1M6.6 6.9A15.9 15.9 0 0 0 2 12s3.5 6.5 10 6.5c1.4 0 2.7-.3 3.8-.8M9.9 10a2.75 2.75 0 0 0 3.9 3.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CameraIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.25" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function CloseIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowLeftIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LogoutIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M14 4h-7A1.5 1.5 0 0 0 5.5 5.5v13A1.5 1.5 0 0 0 7 20h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 12h10m0 0-3.5-3.5M20 12l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 3 5 5.8v5.4c0 4.4 3 8.2 7 9.8 4-1.6 7-5.4 7-9.8V5.8L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m9 11.8 2.2 2.2L15.2 9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SearchIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="m14 14 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function FlameIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 21c3.9 0 6.5-2.6 6.5-6.2 0-2.5-1.4-4.4-2.8-6-.4 1-1 1.8-1.9 2.3.2-2.7-1-6-3.8-8.1.2 2.5-.7 4.3-2.1 5.9-1.4 1.6-2.4 3.4-2.4 5.7C5.5 18.4 8.1 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12 21c1.7 0 2.9-1.2 2.9-3 0-1.7-1.2-2.7-2.9-4.4-1.7 1.7-2.9 2.7-2.9 4.4 0 1.8 1.2 3 2.9 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function TrendingUpIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="m3 17 6-6 4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WalletIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M3.5 7A2.5 2.5 0 0 1 6 4.5h11A1.5 1.5 0 0 1 18.5 6v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="3.5" y="7" width="17" height="12.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.5" cy="13.25" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function LayersIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m4.5 12.5 7.5 4.2 7.5-4.2M4.5 16.5 12 20.7l7.5-4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ImageOffIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4.5 4.5 19.5 19.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M8.6 4.5h9.9A1.5 1.5 0 0 1 20 6v9.9M4 8.1v9.4A1.5 1.5 0 0 0 5.5 19h11.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="9.5" cy="9" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="m6 16 3-3 2 2m3-3 2.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MailWarnIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="5.5" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SparklesIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 4.5 13.6 9 18 10.5 13.6 12 12 16.5 10.4 12 6 10.5 10.4 9 12 4.5ZM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2ZM5.5 3l.7 1.8L8 5.5l-1.8.7L5.5 8l-.7-1.8L3 5.5l1.8-.7L5.5 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* Card network marks — simplified, recognizable shapes; not official assets. */

export function VisaMark({ className = "h-4 w-10" }: IconProps) {
  return (
    <svg viewBox="0 0 48 16" className={className} aria-label="Visa">
      <text
        x="24"
        y="13"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="15"
        fontWeight="800"
        fontStyle="italic"
        letterSpacing="1.5"
        fill="currentColor"
      >
        VISA
      </text>
    </svg>
  );
}

export function MastercardMark({ className = "h-5 w-8" }: IconProps) {
  return (
    <svg viewBox="0 0 36 22" className={className} aria-label="Mastercard">
      <circle cx="13" cy="11" r="10" fill="#EB001B" />
      <circle cx="23" cy="11" r="10" fill="#F79E1B" />
      <path d="M18 3.2a9.97 9.97 0 0 1 0 15.6 9.97 9.97 0 0 1 0-15.6Z" fill="#FF5F00" />
    </svg>
  );
}

export function AmexMark({ className = "h-5 w-8" }: IconProps) {
  return (
    <svg viewBox="0 0 40 22" className={className} aria-label="American Express">
      <rect width="40" height="22" rx="3" fill="#016FD0" />
      <text
        x="20"
        y="14.5"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="9"
        fontWeight="800"
        letterSpacing="0.5"
        fill="#FFFFFF"
      >
        AMEX
      </text>
    </svg>
  );
}
