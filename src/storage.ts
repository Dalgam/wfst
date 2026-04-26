import { MASTERED_KEY, PARTS_KEY } from "./constants";

export function loadMastered(): Set<string> {
  try {
    const raw = localStorage.getItem(MASTERED_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return new Set();
}

export function saveMastered(set: Set<string>) {
  localStorage.setItem(MASTERED_KEY, JSON.stringify([...set]));
}

export function loadParts(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(PARTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return {};
}

export function saveParts(parts: Record<string, string[]>) {
  localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
}
