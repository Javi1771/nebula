const GRADIENTS = [
  "linear-gradient(135deg, #005546 0%, #1ebe91 100%)",
  "linear-gradient(135deg, #005073 0%, #41cff0 100%)",
  "linear-gradient(135deg, #0f2d3c 0%, #4ba591 100%)",
  "linear-gradient(135deg, #005546 0%, #3cdcf0 100%)",
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

export function Avatar({
  name,
  avatarUrl,
  size = 40,
  className = "",
}: {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
}) {
  if (avatarUrl) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-full ${className}`}
        style={{ width: size, height: size }}
      >
        {/* Plain <img>: base64 data URLs and arbitrary external hosts can't go
            through the next/image optimizer (only image.tmdb.org is allowed). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt={name} className="absolute inset-0 h-full w-full object-cover" />
      </div>
    );
  }

  const gradient = GRADIENTS[hashString(name) % GRADIENTS.length];

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${className}`}
      style={{ width: size, height: size, background: gradient, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </div>
  );
}
