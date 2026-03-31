import type { Chapter } from '@/lib/types';

const chapter: Chapter = {
  slug: 'few-shot-prompting',
  number: '07',
  title: 'Beispiele nutzen (Few-Shot Prompting)',
  level: 'intermediate',
  lessonMarkdown: `
## Lektion

**Claude Beispiele zu geben, wie es sich verhalten soll (oder nicht soll), ist äußerst effektiv** für:
- Korrekte Antworten
- Antworten im richtigen Format

Diese Methode wird auch als "**Few-Shot Prompting**" bezeichnet. Du begegnest vielleicht auch den Begriffen "Zero-Shot", "n-Shot" oder "One-Shot". Die Anzahl der "Shots" bezeichnet die Anzahl der verwendeten Beispiele im Prompt.

### Beispiele

Angenommen, du baust einen "Eltern-Bot", der Kinderfragen beantwortet. **Claudes Standardantwort ist ziemlich förmlich und roboterhaft** — das würde einem Kind das Herz brechen.

\`\`\`
Prompt: "Will Santa bring me presents on Christmas?"
\`\`\`

Statt den gewünschten Ton ausführlich zu beschreiben, ist es viel einfacher, **Claude einige ideale Antwortbeispiele zu geben**:

\`\`\`
Prompt: "Please complete the conversation by writing the next line, speaking as \\"A\\".
Q: Is the tooth fairy real?
A: Of course, sweetie. Wrap up your tooth and put it under your pillow tonight. There might be something waiting for you in the morning.
Q: Will Santa bring me presents on Christmas?"
\`\`\`

Im folgenden Formatierungsbeispiel könnten wir Claude Schritt für Schritt durch Formatierungsanweisungen führen — oder wir **geben Claude einfach korrekt formatierte Beispiele** und Claude extrapoliert das Muster:

\`\`\`
USER TURN:
"Silvermist Hollow, a charming village, was home to an extraordinary group of individuals.
Among them was Dr. Liam Patel, a neurosurgeon...
Isabella Torres, a self-taught chef...
<individuals>
1. Dr. Liam Patel [NEUROSURGEON]
2. Olivia Chen [ARCHITECT]
3. Ethan Kovacs [MUSICIAN AND COMPOSER]
4. Isabella Torres [CHEF]
</individuals>

[second passage]...
<individuals>
1. Oliver Hamilton [CHEF]
2. Elizabeth Chen [LIBRARIAN]
...
</individuals>

[third passage to extract from]..."

ASSISTANT TURN:
"<individuals>"
\`\`\`

Claude extrapoliert das Muster aus den Beispielen und formatiert den dritten Abschnitt auf die gleiche Weise.
  `,
  exercises: [
    {
      id: 'ex-7-1',
      title: 'Übung 7.1 — E-Mail-Formatierung via Beispiele',
      description:
        'Wir wiederholen Übung 6.2, aber diesmal verwenden wir **"Few-Shot"-Beispiele** im Prompt, um Claude zur richtigen Klassifizierung und Formatierung zu bringen. Der *letzte* Buchstabe in Claudes Ausgabe soll der Kategoriebuchstabe sein.\n\nKategorien:\n- (A) Vorverkaufsfrage\n- (B) Beschädigter oder defekter Artikel\n- (C) Abrechnungsfrage\n- (D) Sonstiges (bitte erläutern)\n\nZu klassifizierende E-Mail: "Hi -- My Mixmaster4000 is producing a strange noise when I operate it. It also smells a bit smoky and plasticky, like burning electronics. I need a replacement."',
      defaultPrompt: 'Please classify this email as either green or blue: {email}',
      defaultSystemPrompt: '',
      editableFields: ['prompt', 'systemPrompt'],
      hint: 'Schreibe Beispiel-E-Mails und klassifiziere sie für Claude (mit genau dem Format, das du möchtest). Tipps:\n1. Mindestens zwei Beispiel-E-Mails.\n2. Das Beispiel-Antwortformat muss genau dem gewünschten Format entsprechen — Claudes Antwort endet mit dem Kategoriebuchstaben.\n3. Stelle sicher, dass die Kategorien und {email} noch im Prompt vorhanden sind.',
      grade: (text: string): boolean => {
        return /B\) B/i.test(text);
      },
    },
  ],
};

export default chapter;
