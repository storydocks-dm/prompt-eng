import type { Chapter } from '@/lib/types';

const chapter: Chapter = {
  slug: 'precognition',
  number: '06',
  title: 'Präkognition (Schritt für Schritt denken)',
  level: 'intermediate',
  lessonMarkdown: `
## Lektion

Stell dir vor, jemand weckt dich auf und stellt dir sofort mehrere komplizierte Fragen, auf die du sofort antworten musst. Wie gut wärst du? Wahrscheinlich nicht so gut wie wenn du **erst in Ruhe nachdenken dürftest**.

Genauso ist es bei Claude.

**Claude Zeit zum schrittweisen Denken zu geben, verbessert manchmal die Genauigkeit** — besonders bei komplexen Aufgaben. Allerdings **zählt Denken nur, wenn es "laut" geschieht**. Man kann Claude nicht bitten zu denken, aber nur die Antwort auszugeben — dann hat kein echtes Denken stattgefunden.

### Beispiele

Im folgenden Prompt ist für einen menschlichen Leser klar, dass der zweite Satz den ersten konterkariert. Aber **Claude nimmt das Wort "unrelated" zu wörtlich**.

\`\`\`
Prompt: "Is this movie review sentiment positive or negative?

This movie blew my mind with its freshness and originality. In totally unrelated news, I have been living under a rock since the year 1900."
\`\`\`

Um Claudes Antwort zu verbessern, **lassen wir Claude erst denken, bevor es antwortet**. Wir buchstabieren die Schritte auf, die Claude durchführen soll. Kombiniert mit etwas Role Prompting ermöglicht dies Claude, die Rezension tiefer zu verstehen.

\`\`\`
System Prompt: "You are a savvy reader of movie reviews."

Prompt: "Is this review sentiment positive or negative? First, write the best arguments for each side in <positive-argument> and <negative-argument> XML tags, then answer.

This movie blew my mind with its freshness and originality. In totally unrelated news, I have been living under a rock since 1900."
\`\`\`

**Claude reagiert manchmal sensitiv auf die Reihenfolge**. Wenn wir in diesem Beispiel die Reihenfolge der Argumente vertauschen (negativ zuerst, positiv zuletzt), kann das Claudes Gesamturteil ändern.

In den meisten Situationen **tendiert Claude dazu, die zweite von zwei Optionen zu wählen** — möglicherweise weil in den Trainingsdaten die zweite Option häufiger korrekt war.

**Denken zu lassen kann Claudes Antwort von falsch zu richtig korrigieren.** Es ist oft so einfach wie das.

\`\`\`
Prompt: "Name a famous movie starring an actor who was born in the year 1956."
\`\`\`

Mit schrittweisem Denken in \`<brainstorm>\`-Tags:

\`\`\`
Prompt: "Name a famous movie starring an actor who was born in the year 1956. First brainstorm about some actors and their birth years in <brainstorm> tags, then give your answer."
\`\`\`
  `,
  exercises: [
    {
      id: 'ex-6-1',
      title: 'Übung 6.1 — E-Mails klassifizieren',
      description:
        'In dieser Übung weisen wir Claude an, E-Mails in folgende Kategorien einzuteilen:\n- (A) Vorverkaufsfrage\n- (B) Beschädigter oder defekter Artikel\n- (C) Abrechnungsfrage\n- (D) Sonstiges (bitte erläutern)\n\nÄndere den **Prompt** so, dass Claude **nur** die korrekte Klassifizierung ausgibt — mit dem **Buchstaben (A–D) in Klammern und dem Namen der Kategorie**.\n\nDie zu klassierende E-Mail lautet: "Hi -- My Mixmaster4000 is producing a strange noise when I operate it. It also smells a bit smoky and plasticky, like burning electronics. I need a replacement."',
      defaultPrompt: 'Please classify this email as either green or blue: {email}',
      defaultSystemPrompt: '',
      editableFields: ['prompt', 'systemPrompt'],
      hint: 'Die Bewertung sucht nach "B) B" in der Antwort. Schritte:\n1. Füge alle vier Kategorien mit Klammern in den Prompt ein.\n2. Reduziere überflüssigen Text, sodass Claude direkt die Klassifizierung ausgibt.\n3. Falls Claude noch falsch klassifiziert, sage ihm, den vollständigen Kategorienamen auszugeben.\n4. Stelle sicher, dass {email} noch im Prompt-Template vorhanden ist.',
      grade: (text: string): boolean => {
        return /B\) B/i.test(text);
      },
    },
    {
      id: 'ex-6-2',
      title: 'Übung 6.2 — E-Mail-Klassifizierung formatieren',
      description:
        'Verfeinere den Output: Claude soll **nur den Buchstaben** der korrekten Klassifizierung in `<answer></answer>`-Tags ausgeben. Die Antwort auf die erste E-Mail sollte genau `<answer>B</answer>` enthalten.',
      defaultPrompt: 'Please classify this email as either green or blue: {email}',
      defaultSystemPrompt: '',
      editableFields: ['prompt', 'systemPrompt'],
      hint: 'Die Bewertung sucht nach dem korrekten Buchstaben in <answer>-Tags, z.B. "<answer>B</answer>". Gib Claude ein Beispiel, wie der Output aussehen soll — am besten in <example>-Tags. Vergiss nicht: wenn du Claudes Antwort vorausfüllst, ist dieser Teil nicht Teil der ausgegebenen Antwort.',
      grade: (text: string): boolean => {
        return /<answer>[A-D]<\/answer>/i.test(text);
      },
    },
  ],
};

export default chapter;
