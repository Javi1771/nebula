export interface SavedCard {
  id: string;
  bankId: string;
  last4: string;
  name: string;
  expiry: string;
}

const STORAGE_PREFIX = "nebula-saved-cards:";
const MAX_SAVED = 4;

/** Cards live under a per-user key so one browser profile never leaks another account's cards. */
function storageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

export function getSavedCards(userId: string): SavedCard[] {
  if (typeof window === "undefined" || !userId) return [];
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Only last4/bank/name/expiry ever touch storage — never the full number or CVC. */
export function saveCard(userId: string, card: Omit<SavedCard, "id">): SavedCard[] {
  const existing = getSavedCards(userId).filter(
    (c) => !(c.bankId === card.bankId && c.last4 === card.last4)
  );
  const next = [{ ...card, id: crypto.randomUUID() }, ...existing].slice(0, MAX_SAVED);
  window.localStorage.setItem(storageKey(userId), JSON.stringify(next));
  return next;
}

export function removeSavedCard(userId: string, id: string): SavedCard[] {
  const next = getSavedCards(userId).filter((c) => c.id !== id);
  window.localStorage.setItem(storageKey(userId), JSON.stringify(next));
  return next;
}
