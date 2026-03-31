// src/lib/progress.ts
const STORAGE_KEY = 'prompt-eng-progress';

export function getSolvedExercises(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function markExerciseSolved(id: string): void {
  const solved = getSolvedExercises();
  solved.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...solved]));
}
