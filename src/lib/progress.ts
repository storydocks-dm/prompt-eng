// src/lib/progress.ts
const STORAGE_KEY = 'prompt-eng-progress';

export function getSolvedExercises(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function markExerciseSolved(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const solved = getSolvedExercises();
    solved.add(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...solved]));
  } catch {
    // Silently fail (quota exceeded, storage disabled, etc.)
  }
}
