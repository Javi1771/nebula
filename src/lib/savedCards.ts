export interface SavedCard {
  id: string;
  bankId: string;
  last4: string;
  name: string;
  expiry: string;
}

const STORAGE_KEY = "nebula-saved-cards";
const MAX_SAVED = 4;

export function getSavedCards(): SavedCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Only last4/bank/name/expiry ever touch storage — never the full number or CVC. */
export function saveCard(card: Omit<SavedCard, "id">): SavedCard[] {
  const existing = getSavedCards().filter(
    (c) => !(c.bankId === card.bankId && c.last4 === card.last4)
  );
  const next = [{ ...card, id: crypto.randomUUID() }, ...existing].slice(0, MAX_SAVED);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function removeSavedCard(id: string): SavedCard[] {
  const next = getSavedCards().filter((c) => c.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
