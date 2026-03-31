import type { Chapter } from '@/lib/types';

const chapter: Chapter = {
  slug: 'basic-prompt-structure',
  number: '01',
  title: 'Grundlegende Prompt-Struktur',
  level: 'beginner',
  lessonMarkdown: `
## Lektion

Anthropic bietet zwei APIs an: die ältere Text Completions API und die aktuelle **Messages API**. Wir verwenden ausschließlich die Messages API.

Ein Mindest-Call an Claude benötigt:
- \`model\` — API-Modellname
- \`max_tokens\` — maximale Token-Anzahl (Hard Stop, kann mitten im Wort abbrechen)
- \`messages\` — Array mit \`user\`/\`assistant\`-Paaren. Das erste muss immer \`user\` sein, sie müssen abwechseln.

Optional:
- \`system\` — System-Prompt
- \`temperature\` — Variabilität (0 = deterministisch)

### Beispiele

\`\`\`
Prompt: "Hi Claude, how are you?"
\`\`\`

\`\`\`
Prompt: "Can you tell me the color of the ocean?"
\`\`\`

\`\`\`
Prompt: "What year was Celine Dion born in?"
\`\`\`

### Fehlerhafte Formatierung

\`user\` und \`assistant\` Nachrichten **müssen abwechseln**, und die Liste **muss mit \`user\` beginnen**. Fehler dabei führen zu API-Fehlern.

### System-Prompts

Ein System-Prompt gibt Claude Kontext, Anweisungen und Richtlinien **bevor** die eigentliche Frage gestellt wird. Er existiert getrennt von den \`user\`/\`assistant\`-Nachrichten.

Beispiel:

\`\`\`
System: "Your answer should always be a series of critical thinking questions that
further the conversation. Do not actually answer the user question."

User: "Why is the sky blue?"
\`\`\`

Ein guter System-Prompt verbessert Claudes Performance erheblich — z.B. bei der Einhaltung von Regeln und Anweisungen.
  `,
  exercises: [
    {
      id: 'ex-1-1',
      title: 'Übung 1.1 — Bis drei zählen',
      description:
        'Schreibe einen Prompt, der Claude dazu bringt, **bis drei zu zählen**. Die Bewertung prüft, ob die Antwort die Ziffern 1, 2 und 3 enthält.',
      defaultPrompt: '[Ersetze diesen Text]',
      defaultSystemPrompt: '',
      editableFields: ['prompt'],
      hint: 'Die Bewertung sucht nach den arabischen Ziffern "1", "2" und "3". Frag Claude einfach direkt darum.',
      grade: (text: string): boolean => {
        return /1/.test(text) && /2/.test(text) && /3/.test(text);
      },
    },
    {
      id: 'ex-1-2',
      title: 'Übung 1.2 — System-Prompt',
      description:
        'Ändere den **System-Prompt** so, dass Claude antwortet wie ein **3-jähriges Kind**.',
      defaultPrompt: 'How big is the sky?',
      defaultSystemPrompt: '[Ersetze diesen Text]',
      editableFields: ['systemPrompt'],
      hint: 'Die Bewertung sucht nach "giggles" oder "soo" in der Antwort. Weise Claude in einem System-Prompt an, wie ein kleines Kind zu sprechen — auf Englisch, damit die Bewertung funktioniert.',
      grade: (text: string): boolean => {
        return /giggles/i.test(text) || /soo/i.test(text);
      },
    },
  ],
};

export default chapter;
