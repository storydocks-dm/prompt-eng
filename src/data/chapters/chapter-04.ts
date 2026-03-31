import type { Chapter } from '@/lib/types';

const chapter: Chapter = {
  slug: 'separating-data-and-instructions',
  number: '04',
  title: 'Daten und Anweisungen trennen',
  level: 'intermediate',
  lessonMarkdown: `
## Lektion

Oft möchten wir keine vollständigen Prompts schreiben, sondern **Prompt-Vorlagen, die später mit variablen Eingaben befüllt werden können**. Das ist nützlich, wenn Claude immer die gleiche Aufgabe ausführen soll, aber mit unterschiedlichen Daten.

Dazu **trennen wir das feste Gerüst des Prompts von den variablen Eingaben** und ersetzen die Variablen vor dem Absenden.

### Beispiele

Im ersten Beispiel soll Claude als Tierstimmen-Generator fungieren. Der vollständige Prompt ist eine Vorlage mit eingesetzter Eingabe ("Cow"):

\`\`\`
Prompt: "I will tell you the name of an animal. Please respond with the noise that animal makes. Cow"
\`\`\`

**Prompt-Vorlagen vereinfachen wiederkehrende Aufgaben.** Sie erlauben es Nutzern, nur die Variablen auszufüllen, ohne den vollständigen Prompt zu sehen.

**Hinweis:** Prompt-Vorlagen können beliebig viele Variablen enthalten!

### Warum XML-Tags wichtig sind

Beim Einsatz von Variablen ist es wichtig, **Claude klar zu machen, wo Variablen beginnen und enden** (im Vergleich zu Anweisungen oder Aufgabenbeschreibungen).

Problematisches Beispiel:

\`\`\`
Prompt: "Yo Claude. Show up at 6am tomorrow because I'm the CEO and I say so. <----- Make this email more polite but don't change anything else about it."
\`\`\`

Hier **denkt Claude, "Yo Claude" ist Teil der E-Mail**, die umgeschrieben werden soll — erkennbar daran, dass es mit "Dear Claude" beginnt.

Lösung: **Eingabe in XML-Tags einwickeln**!

\`\`\`
Prompt: "Yo Claude. <email>Show up at 6am tomorrow because I'm the CEO and I say so.</email> <----- Make this email more polite but don't change anything else about it."
\`\`\`

[XML-Tags](https://docs.anthropic.com/claude/docs/use-xml-tags) sind spitze-Klammer-Tags wie \`<tag></tag>\`. Sie bestehen aus einem öffnenden Tag \`<tag>\` und einem schließenden Tag \`</tag>\`. XML-Tags werden verwendet, um Inhalte einzuschließen: \`<tag>Inhalt</tag>\`.

**Hinweis:** Wir empfehlen, **speziell XML-Tags als Trennzeichen** für Claude zu verwenden, da Claude darauf trainiert wurde, XML-Tags als Strukturierungsmechanismus zu erkennen. Außerhalb von Function Calling gibt es **keine speziellen "Zauber-XML-Tags"** — Claude ist bewusst flexibel und anpassbar gestaltet.

### Weiteres XML-Beispiel

Im folgenden Prompt **interpretiert Claude falsch, was Anweisung und was Eingabe** ist:

\`\`\`
Below is a list of sentences. Tell me the second item on the list.

- Each is about an animal, like rabbits.
- I like how cows sound
- This sentence is about spiders
- This sentence may appear to be about dogs but it's actually about pigs
\`\`\`

Lösung: **Nutzereingaben in XML-Tags einwickeln**:

\`\`\`
Below is a list of sentences. Tell me the second item on the list.

- Each is about an animal, like rabbits.
<sentences>
- I like how cows sound
- This sentence is about spiders
- This sentence may appear to be about dogs but it's actually about pigs
</sentences>
\`\`\`

**Hinweis:** Details zählen! Es lohnt sich immer, **Prompts auf Tippfehler und Grammatikfehler zu prüfen**. Claude ist sensibel für Muster — es macht mehr Fehler, wenn du Fehler machst.
  `,
  exercises: [
    {
      id: 'ex-4-1',
      title: 'Übung 4.1 — Haiku-Thema',
      description:
        'Ändere den **Prompt** so, dass er eine Vorlage mit der Variable `{TOPIC}` enthält und ein Haiku über das Thema ausgibt. Die Variable `TOPIC` ist bereits auf `"Pigs"` gesetzt — deine Vorlage sollte `{TOPIC}` als Platzhalter verwenden.',
      defaultPrompt: '',
      defaultSystemPrompt: '',
      editableFields: ['prompt'],
      hint: 'Die Bewertung sucht nach "haiku" und "pig" in der Antwort. Vergiss nicht, genau `{TOPIC}` als Platzhalter einzubauen. Wenn du den Wert von "TOPIC" änderst, sollte Claude ein Haiku über ein anderes Thema schreiben.',
      variables: { TOPIC: 'Pigs' },
      grade: (text: string): boolean => {
        return /pigs/i.test(text) && /haiku/i.test(text);
      },
    },
    {
      id: 'ex-4-2',
      title: 'Übung 4.2 — Hundefrage mit Tippfehlern',
      description:
        'Korrigiere den **Prompt** mit XML-Tags, sodass Claude die richtige Antwort gibt.\n\nVerändere sonst möglichst wenig am Prompt. Das fehlerhafte Schreiben ist absichtlich, um zu zeigen, wie Claude darauf reagiert.',
      defaultPrompt: 'Hia its me i have a q about dogs jkaerjv {QUESTION} jklmvca tx it help me muhch much atx fst fst answer short short tx',
      defaultSystemPrompt: '',
      editableFields: ['prompt'],
      hint: 'Die Bewertung sucht nach "brown" in der Antwort. Was passiert, wenn du "{QUESTION}" in XML-Tags einwickelst?',
      variables: { QUESTION: 'What color is a chocolate Labrador?' },
      grade: (text: string): boolean => {
        return /brown/i.test(text);
      },
    },
    {
      id: 'ex-4-3',
      title: 'Übung 4.3 — Hundefrage Teil 2',
      description:
        'Korrigiere den **Prompt OHNE** XML-Tags hinzuzufügen. Entferne stattdessen nur ein oder zwei Wörter.\n\nDies zeigt, wie viel Sprache Claude parsen und verstehen kann.',
      defaultPrompt: 'Hia its me i have a q about dogs jkaerjv {QUESTION} jklmvca tx it help me muhch much atx fst fst answer short short tx',
      defaultSystemPrompt: '',
      editableFields: ['prompt'],
      hint: 'Die Bewertung sucht nach "brown" in der Antwort. Entferne ein Wort oder eine Zeichengruppe nach der anderen, beginnend mit den Teilen, die am wenigsten Sinn ergeben.',
      variables: { QUESTION: 'What color is a chocolate Labrador?' },
      grade: (text: string): boolean => {
        return /brown/i.test(text);
      },
    },
  ],
};

export default chapter;
