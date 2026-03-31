import type { Chapter } from '@/lib/types';

const chapter: Chapter = {
  slug: 'being-clear-and-direct',
  number: '02',
  title: 'Klar und direkt formulieren',
  level: 'beginner',
  lessonMarkdown: `
## Lektion

**Claude reagiert am besten auf klare und direkte Anweisungen.**

Stell dir Claude wie einen neuen Mitarbeiter vor, der noch keinen Kontext hat. **Claude weiß ohne explizite Anleitung nicht, was zu tun ist.** Genau wie bei der ersten Einweisung eines Kollegen gilt: Je klarer und direkter du erklärt, was du willst, desto besser und genauer ist Claudes Antwort.

Im Zweifelsfall gilt die **Goldene Regel klarer Prompts**:
- Zeig deinen Prompt einem Kollegen oder Freund und lass ihn die Anweisung selbst ausführen. Wenn er verwirrt ist, ist Claude es auch.

### Beispiele

Nehmen wir das Schreiben von Gedichten als Aufgabe.

\`\`\`
Prompt: "Write a haiku about robots."
\`\`\`

Das Haiku ist ganz nett, aber vielleicht möchtest du, dass Claude direkt ins Gedicht einsteigt, ohne eine Einleitung wie "Here is a haiku".

Wie erreichen wir das? Wir **fragen direkt danach**!

\`\`\`
Prompt: "Write a haiku about robots. Skip the preamble; go straight into the poem."
\`\`\`

Ein weiteres Beispiel: Fragen wir Claude nach dem besten Basketballspieler aller Zeiten. Claude nennt mehrere Namen, **ohne sich auf einen einzigen "Besten" festzulegen**.

\`\`\`
Prompt: "Who is the best basketball player of all time?"
\`\`\`

Können wir Claude dazu bringen, sich zu entscheiden? Ja! Einfach direkt fragen!

\`\`\`
Prompt: "Who is the best basketball player of all time? Yes, there are differing opinions, but if you absolutely had to pick one player, who would it be?"
\`\`\`
  `,
  exercises: [
    {
      id: 'ex-2-1',
      title: 'Übung 2.1 — Spanisch',
      description:
        'Ändere den **System-Prompt** so, dass Claude seine Antwort auf **Spanisch** ausgibt.',
      defaultPrompt: 'Hello Claude, how are you?',
      defaultSystemPrompt: '[Ersetze diesen Text]',
      editableFields: ['systemPrompt'],
      hint: 'Die Bewertung sucht nach einer Antwort, die das Wort "hola" enthält. Weise Claude an, auf Spanisch zu antworten — genau so, wie du es einem Menschen sagen würdest.',
      grade: (text: string): boolean => {
        return /hola/i.test(text);
      },
    },
    {
      id: 'ex-2-2',
      title: 'Übung 2.2 — Nur ein Spieler',
      description:
        'Ändere den **Prompt** so, dass Claude **ausschließlich** den Namen eines einzigen Spielers ausgibt — ohne weitere Wörter oder Satzzeichen.',
      defaultPrompt: '[Ersetze diesen Text]',
      defaultSystemPrompt: '',
      editableFields: ['prompt'],
      hint: 'Die Bewertung sucht nach exakt "Michael Jordan". Wie würdest du einem Menschen sagen, nur den Namen und sonst nichts zu antworten? Es gibt mehrere Wege.',
      grade: (text: string): boolean => {
        return text.trim() === 'Michael Jordan';
      },
    },
    {
      id: 'ex-2-3',
      title: 'Übung 2.3 — Eine Geschichte schreiben',
      description:
        'Ändere den **Prompt** so, dass Claude eine **möglichst lange Antwort** produziert. Wenn deine Antwort **über 800 Wörter** hat, gilt die Übung als bestanden.',
      defaultPrompt: '[Ersetze diesen Text]',
      defaultSystemPrompt: '',
      editableFields: ['prompt'],
      hint: 'Die Bewertung zählt Wörter und erwartet mindestens 800. Da LLMs beim Wörterzählen ungenau sind, solltest du etwas mehr anfordern als nötig.',
      grade: (text: string): boolean => {
        const trimmed = text.trim();
        const words = trimmed.split(/\s+/).length;
        return words >= 800;
      },
    },
  ],
};

export default chapter;
