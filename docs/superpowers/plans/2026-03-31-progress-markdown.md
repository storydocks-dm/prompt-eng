# Progress & Markdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zeige gelöste Übungen als "x/y"-Zähler in ChapterNav und rendere Claude-Antworten als Markdown.

**Architecture:** Neues `progress.ts`-Modul kapselt localStorage-Zugriff. ExerciseCell schreibt bei erfolgreichem Grading und dispatcht `progress-updated`. ChapterNav lauscht auf dieses Event und aktualisiert seinen State. Markdown-Rendering ersetzt rohe Text-Divs in ExerciseCell und PlaygroundCell.

**Tech Stack:** Next.js 15, React, TypeScript, Tailwind CSS, react-markdown, remark-gfm

---

### Task 1: progress.ts anlegen

**Files:**
- Create: `src/lib/progress.ts`

- [ ] **Schritt 1: Datei erstellen**

```typescript
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
```

- [ ] **Schritt 2: TypeScript prüfen**

```bash
cd prompt-eng && npx tsc --noEmit
```

Erwartet: keine Fehler.

- [ ] **Schritt 3: Committen**

```bash
git add src/lib/progress.ts
git commit -m "feat: add localStorage progress utilities"
```

---

### Task 2: ExerciseCell — Progress speichern + Markdown-Rendering

**Files:**
- Modify: `src/components/ExerciseCell.tsx`

- [ ] **Schritt 1: Import hinzufügen**

Zeile 4 einfügen (nach bestehendem `gradeExercise`-Import):
```typescript
import { markExerciseSolved } from '@/lib/progress';
```

- [ ] **Schritt 2: Progress speichern nach erfolgreichem Grading**

Den bestehenden Block in `run()`:
```typescript
setResponse(data.text);
setGraded(await gradeExercise(exercise.id, data.text));
```

Ersetzen durch:
```typescript
setResponse(data.text);
const result = await gradeExercise(exercise.id, data.text);
setGraded(result);
if (result) {
  markExerciseSolved(exercise.id);
  window.dispatchEvent(new Event('progress-updated'));
}
```

- [ ] **Schritt 3: Response-Panel auf Markdown umstellen**

Den bestehenden Block:
```tsx
<div className="bg-stone-50 border border-stone-200 rounded-lg p-3 font-mono text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
  {response}
</div>
```

Ersetzen durch:
```tsx
<div className="bg-stone-50 border border-stone-200 rounded-lg p-3 max-h-64 overflow-y-auto prose prose-sm prose-stone max-w-none prose-pre:bg-stone-900 prose-code:text-xs">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
</div>
```

- [ ] **Schritt 4: TypeScript prüfen**

```bash
npx tsc --noEmit
```

Erwartet: keine Fehler.

- [ ] **Schritt 5: Committen**

```bash
git add src/components/ExerciseCell.tsx
git commit -m "feat: save progress on correct grading, render response as markdown"
```

---

### Task 3: PlaygroundCell — Markdown-Rendering

**Files:**
- Modify: `src/components/PlaygroundCell.tsx`

- [ ] **Schritt 1: Imports hinzufügen**

Nach `import { useState } from 'react';` einfügen:
```typescript
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
```

- [ ] **Schritt 2: Response-Panel umstellen**

Den bestehenden Block:
```tsx
<div className="mt-3 bg-white border border-stone-200 rounded-lg p-3 font-mono text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
  {response}
</div>
```

Ersetzen durch:
```tsx
<div className="mt-3 bg-white border border-stone-200 rounded-lg p-3 max-h-64 overflow-y-auto prose prose-sm prose-stone max-w-none prose-pre:bg-stone-900 prose-code:text-xs">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
</div>
```

- [ ] **Schritt 3: TypeScript prüfen**

```bash
npx tsc --noEmit
```

Erwartet: keine Fehler.

- [ ] **Schritt 4: Committen**

```bash
git add src/components/PlaygroundCell.tsx
git commit -m "feat: render playground response as markdown"
```

---

### Task 4: ChapterNav — Fortschrittsanzeige

**Files:**
- Modify: `src/components/ChapterNav.tsx`

- [ ] **Schritt 1: Imports erweitern**

Bestehende Zeile:
```typescript
import { usePathname } from 'next/navigation';
```

Ersetzen durch:
```typescript
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getSolvedExercises } from '@/lib/progress';
```

- [ ] **Schritt 2: State + Effect in Komponente hinzufügen**

Direkt nach `const pathname = usePathname();` einfügen:
```typescript
const [solved, setSolved] = useState<Set<string>>(new Set());

useEffect(() => {
  setSolved(getSolvedExercises());
  const refresh = () => setSolved(getSolvedExercises());
  window.addEventListener('progress-updated', refresh);
  window.addEventListener('storage', refresh);
  return () => {
    window.removeEventListener('progress-updated', refresh);
    window.removeEventListener('storage', refresh);
  };
}, []);
```

- [ ] **Schritt 3: Zähler im Chapter-Link anzeigen**

Den bestehenden Link-Inhalt:
```tsx
<span className="text-xs text-stone-400 font-mono w-6 shrink-0">
  {ch.number}
</span>
<span className="truncate">{ch.title}</span>
```

Ersetzen durch:
```tsx
<span className="text-xs text-stone-400 font-mono w-6 shrink-0">
  {ch.number}
</span>
<span className="truncate flex-1">{ch.title}</span>
{ch.exercises.length > 0 && (
  <span
    className={`text-xs font-mono shrink-0 ${
      ch.exercises.every((ex) => solved.has(ex.id))
        ? 'text-green-600'
        : 'text-stone-400'
    }`}
  >
    {ch.exercises.filter((ex) => solved.has(ex.id)).length}/{ch.exercises.length}
  </span>
)}
```

- [ ] **Schritt 4: TypeScript prüfen**

```bash
npx tsc --noEmit
```

Erwartet: keine Fehler.

- [ ] **Schritt 5: Manuell testen**

```bash
npm run dev
```

- Kapitel öffnen → Übung korrekt lösen → Seitenleiste zeigt z.B. `"1/2"` in grau
- Alle Übungen eines Kapitels lösen → Zähler wird grün
- Seite neu laden → Fortschritt bleibt erhalten (localStorage)

- [ ] **Schritt 6: Committen**

```bash
git add src/components/ChapterNav.tsx
git commit -m "feat: show exercise progress counter in chapter nav"
```

---

### Task 5: Pushen

- [ ] **Push zu GitHub**

```bash
git push origin br-tooluse
```
