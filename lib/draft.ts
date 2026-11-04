import type { RentalDraft } from "./rentalModels";

// What the booking steps carry from page to page before anything is sent. Kept in
// sessionStorage so a refresh keeps it; every access is guarded because storage can
// be blocked (private windows, previews).

export type StoredDraft = RentalDraft & { /** One per checkout attempt, so a double click or retry can't book twice. */ attemptKey?: string };

const key = (slug: string) => `carlot-draft:${slug}`;

export function readDraft(slug: string): StoredDraft | null {
  try {
    const raw = sessionStorage.getItem(key(slug));
    return raw ? (JSON.parse(raw) as StoredDraft) : null;
  } catch {
    return null;
  }
}

export function writeDraft(slug: string, draft: StoredDraft) {
  try {
    sessionStorage.setItem(key(slug), JSON.stringify(draft));
  } catch {}
}

export function clearDraft(slug: string) {
  try {
    sessionStorage.removeItem(key(slug));
  } catch {}
}

export const newAttemptKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
