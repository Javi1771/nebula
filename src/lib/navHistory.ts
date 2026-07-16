/**
 * Tiny in-app navigation trail kept in sessionStorage. The back buttons in the
 * UI promise a destination ("Volver al catálogo"), so instead of a blind
 * history.back() — which can land on another movie, a login page, or leave the
 * site — they look up the most recent URL we actually visited for that route
 * (keeping its query string: filters, search, tab) and push it.
 */
const KEY = "nebula-nav-trail";
const MAX_ENTRIES = 50;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(trail: string[]) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(trail));
  } catch {
    // Storage full/blocked — back buttons degrade to their fallback route.
  }
}

export function recordNavigation(url: string) {
  const trail = read();
  if (trail[trail.length - 1] === url) return;
  // Arriving at the entry just below the top means the user went back.
  if (trail.length >= 2 && trail[trail.length - 2] === url) {
    trail.pop();
    write(trail);
    return;
  }
  trail.push(url);
  if (trail.length > MAX_ENTRIES) trail.shift();
  write(trail);
}

/** Most recent visited URL whose pathname matches, e.g. "/" -> "/?genre=Drama". */
export function lastVisited(pathname: string): string | null {
  const trail = read();
  for (let i = trail.length - 1; i >= 0; i--) {
    if (trail[i].split("?")[0] === pathname) return trail[i];
  }
  return null;
}
