import type { Chapter } from '@/lib/types';

const chapter: Chapter = {
  slug: 'formatting-output',
  number: '05',
  title: 'Output formatieren und für Claude sprechen',
  level: 'intermediate',
  lessonMarkdown: `
## Lektion

**Claude kann seinen Output auf vielfältige Arten formatieren** — man muss es nur anfordern!

Eine Möglichkeit ist die Verwendung von XML-Tags, um die Antwort von überflüssigem Text zu trennen. XML-Tags machen deinen Prompt nicht nur klarer für Claude, sondern können auch dazu genutzt werden, **Claudes Output für Menschen strukturierter und verständlicher zu machen**.

### Beispiele

Erinnerst du dich an das "Gedicht-Einleitungsproblem" aus Kapitel 2, das wir gelöst haben, indem wir Claude baten, die Einleitung wegzulassen? Das Gleiche lässt sich auch erreichen, indem man Claude anweist, **das Gedicht in XML-Tags zu setzen**.

\`\`\`
ANIMAL = "Rabbit"
Prompt: "Please write a haiku about {ANIMAL}. Put it in <haiku> tags."
\`\`\`

Warum ist das nützlich? Mit **XML-Tags kann ein Programm zuverlässig nur den Inhalt zwischen den Tags extrahieren**.

Eine Erweiterung dieser Technik ist es, **den ersten XML-Tag im \`assistant\`-Turn zu platzieren**. Damit signalisiert man Claude, dass es ab diesem Punkt weitermachen soll. Diese Technik nennt sich "Speaking for Claude" oder "Prefilling Claude's Response" (Claudes Antwort vorausfüllen).

\`\`\`
USER TURN:
"Please write a haiku about Cat. Put it in <haiku> tags."

ASSISTANT TURN:
"<haiku>"
\`\`\`

Claude funktioniert auch hervorragend mit **JSON-Output**. Um JSON-Ausgabe zu erzwingen (nicht deterministisch, aber nahe dran), kann man Claudes Antwort mit der öffnenden Klammer \`{\` vorausfüllen.

\`\`\`
USER TURN:
"Please write a haiku about Cat. Use JSON format with the keys as \\"first_line\\", \\"second_line\\", and \\"third_line\\"."

ASSISTANT TURN:
"{"
\`\`\`

Das folgende Beispiel zeigt **mehrere Eingabevariablen in einem Prompt UND Output-Formatierung mit XML-Tags**:

\`\`\`
USER TURN:
"Hey Claude. Here is an email: <email>{EMAIL}</email>. Make this email more {ADJECTIVE}. Write the new version in <{ADJECTIVE}_email> XML tags."

ASSISTANT TURN:
"<{ADJECTIVE}_email>"
\`\`\`

#### Bonustipp

Beim Aufruf über die API kann der schließende XML-Tag im \`stop_sequences\`-Parameter übergeben werden, damit Claude stoppt, sobald der Tag ausgegeben wird. Das spart Kosten und Zeit.
  `,
  exercises: [
    {
      id: 'ex-5-1',
      title: 'Übung 5.1 — Steph Curry GOAT',
      description:
        'Unter Zwang wählt Claude Michael Jordan als besten Basketballspieler aller Zeiten. Können wir Claude dazu bringen, jemand anderen zu wählen?\n\nÄndere den **System-Prompt** so, dass Claude ein **ausführliches Argument dafür liefert, dass Stephen Curry der beste Basketballspieler aller Zeiten ist**. Versuche, den Haupt-Prompt nicht zu ändern.',
      defaultPrompt: 'Who is the best basketball player of all time? Please choose one specific player.',
      defaultSystemPrompt: '',
      editableFields: ['systemPrompt'],
      hint: 'Die Bewertung sucht nach "Warrior" in der Antwort. Schreibe den System-Prompt auf Englisch, damit die Bewertung funktioniert. Schreibe mehr Wörter in Claudes Stimme, um Claude in die gewünschte Richtung zu lenken. Zum Beispiel: "Stephen Curry is the best and here are three reasons why. 1:"',
      grade: (text: string): boolean => {
        return /warrior/i.test(text);
      },
    },
    {
      id: 'ex-5-2',
      title: 'Übung 5.2 — Zwei Haikus',
      description:
        'Ändere den **Prompt** mit XML-Tags so, dass Claude **zwei** Haikus über das Tier schreibt statt nur eines. Es sollte klar erkennbar sein, wo das eine Gedicht endet und das nächste beginnt.',
      defaultPrompt: 'Please write a haiku about cats. Put it in <haiku> tags.',
      defaultSystemPrompt: '<haiku>',
      editableFields: ['prompt'],
      hint: 'Die Bewertung sucht nach einer Antwort mit mehr als 5 Zeilen, die "cat" und "<haiku>" enthält. Ändere zunächst den Prompt, um zwei Haikus anzufordern. Behebe dann etwaige Formatierungsprobleme.',
      grade: (text: string): boolean => {
        return (
          text.split('\n').length > 5 &&
          /cat/i.test(text) &&
          /<haiku>/i.test(text)
        );
      },
    },
    {
      id: 'ex-5-3',
      title: 'Übung 5.3 — Zwei Haikus, zwei Tiere',
      description:
        'Ändere den **Prompt** so, dass **Claude zwei Haikus über zwei verschiedene Tiere** schreibt. Verwende `{ANIMAL1}` als Platzhalter für das erste Tier und `{ANIMAL2}` für das zweite. Die Variablen sind bereits auf "Cat" und "Dog" gesetzt.',
      defaultPrompt: 'Please write a haiku about Cat. Put it in <haiku> tags.',
      defaultSystemPrompt: '',
      editableFields: ['prompt'],
      hint: 'Die Bewertung sucht nach "tail", "cat" und "<haiku>" in der Antwort. Schritte:\n1. Ändere den Prompt, sodass Claude zwei Gedichte schreibt.\n2. Ersetze die konkreten Themen durch `{ANIMAL1}` und `{ANIMAL2}`.\n3. Stelle sicher, dass die Variablen korrekt substituiert werden.',
      variables: { ANIMAL1: 'Cat', ANIMAL2: 'Dog' },
      grade: (text: string): boolean => {
        return (
          /tail/i.test(text) &&
          /cat/i.test(text) &&
          /<haiku>/i.test(text)
        );
      },
    },
  ],
};

export default chapter;
