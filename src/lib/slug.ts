/** Clean, URL-safe, accent-free slug for display strings used in shareable links (e.g. genre names). */
export function slugify(value: string): string {
  const withoutAccents = value
    .normalize("NFD")
    .split("")
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return code < 0x0300 || code > 0x036f; // strip NFD combining diacritics
    })
    .join("");

  return withoutAccents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
