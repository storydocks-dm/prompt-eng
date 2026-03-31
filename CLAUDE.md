# CLAUDE.md — Prompt Engineering Trainer

## Stack & Setup

- **Framework:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **AI-Model:** `claude-haiku-4-5-20251001` via Anthropic SDK
- **API-Route:** `src/app/api/complete/route.ts` — nimmt `prompt` + `systemPrompt`, gibt Text zurück
- **Grading:** Server Action `src/lib/actions.ts` → `gradeExercise()` — sucht Chapter-ID, ruft `exercise.grade()` auf
- **Env-Variable lokal:** `ANTHROPIC_API_KEY` in `.env.local` (nicht im Repo)

## Deployment

- **Plattform:** Vercel — erkennt Next.js automatisch, `vercel.json` ist bewusst leer `{}`
- **Repo:** `https://github.com/storydocks-dm/prompt-eng.git`
- **Arbeits-Branch:** `br-tooluse`
- **Env-Variable Vercel:** `ANTHROPIC_API_KEY` muss im Vercel-Dashboard gesetzt sein

## Inhalt & Konventionen

- **Sprache:** UI und alle Kapitel-Inhalte auf **Deutsch**
- **Kapitel-Daten:** `src/data/chapters/chapter-00.ts` bis `chapter-09.ts`
- **Neue Kapitel:** In `src/data/chapters/` anlegen + in `index.ts` importieren
- **Slugs nie ändern** — werden für statische URL-Generierung (`generateStaticParams`) verwendet

## Bekannte Gotchas

- Bewertungsfunktionen (`grade`) prüfen auf **englische Keywords** in Claudes Antwort (z.B. `"incorrect"`, `"warrior"`, `"hola"`) — Prompts/System-Prompts, die Claudes Antwortsprache ändern, können die Bewertung brechen
- Wenn ein Übungs-Hint auf ein englisches Keyword hinweist, muss der Hint **explizit darauf hinweisen**, dass der Prompt auf Englisch bleiben soll
- `SerializableExercise` vs. `Exercise`: Die `grade`-Funktion wird nie an den Client übergeben — nur über Server Action aufrufbar
- `AmazonBedrock/` und `Anthropic 1P/` Ordner sind Jupyter-Notebooks — unabhängig von der Web-App, nicht anfassen

## Offene Punkte

- Fortschrittsanzeige (welche Übungen wurden gelöst) fehlt noch
- Claude-Antworten im Response-Panel werden als Plain-Text gerendert, kein Markdown
