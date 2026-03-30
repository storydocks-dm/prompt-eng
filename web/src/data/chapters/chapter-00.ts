import type { Chapter } from '@/lib/types';

const chapter: Chapter = {
  slug: 'setup',
  number: '00',
  title: 'Tutorial How-To',
  level: 'setup',
  lessonMarkdown: `
## Willkommen zum Prompt Engineering Tutorial

Dieses Tutorial zeigt dir Schritt für Schritt, wie du optimale Prompts für Claude schreibst.

### Was dich erwartet

Jedes Kapitel besteht aus:
1. **Lektion** — Erklärungen und Beispiele
2. **Übungen** — Interaktive Aufgaben mit automatischer Bewertung
3. **Playground** — Freies Experimentieren am Ende

### Das Modell

Wir verwenden **Claude Haiku** — das schnellste und günstigste Claude-Modell. Alle Techniken funktionieren auch mit Claude Sonnet und Opus.

### Temperatur

Alle Beispiele laufen mit **Temperatur 0**, was deterministische Antworten erzeugt. Mehr dazu in späteren Kapiteln.

### Die Messages API

Claude nutzt die Messages API. Ein minimaler API-Call braucht:
- \`model\` — welches Claude-Modell
- \`max_tokens\` — maximale Antwortlänge
- \`messages\` — Array mit abwechselnden \`user\`/\`assistant\`-Nachrichten

Optional:
- \`system\` — System-Prompt für Kontext und Anweisungen
- \`temperature\` — Variabilität der Antworten (0 = deterministisch)

### Beispiel

\`\`\`python
import anthropic

client = anthropic.Anthropic(api_key="sk-ant-...")

message = client.messages.create(
    model="claude-haiku-4-5-20251001",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello, Claude!"}]
)
print(message.content[0].text)
\`\`\`

Wenn du bereit bist, geh zu **Kapitel 1: Basic Prompt Structure**.
  `,
  exercises: [],
};

export default chapter;
