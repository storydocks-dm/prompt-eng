import type { Chapter } from '@/lib/types';

const chapter: Chapter = {
  slug: 'avoiding-hallucinations',
  number: '08',
  title: 'Halluzinationen vermeiden',
  level: 'advanced',
  lessonMarkdown: `
## Lektion

Eine schlechte Nachricht: **Claude "halluziniert" manchmal und macht unwahre oder nicht belegte Aussagen**. Die gute Nachricht: Es gibt Techniken, um Halluzinationen zu minimieren.

Wir betrachten:
- Claude die Möglichkeit geben zu sagen, dass es die Antwort nicht kennt
- Claude bitten, erst Belege zu suchen, bevor es antwortet

Es gibt jedoch **viele Methoden gegen Halluzinationen**, einschließlich der Techniken aus diesem Kurs. Wenn Claude halluziniert, experimentiere mit mehreren Techniken.

### Beispiele

Hier eine Frage über Faktenwissen, bei der **Claude mehrere große Nilpferde halluziniert**, weil es möglichst hilfreich sein möchte:

\`\`\`
Prompt: "What are the names of the three largest hippos that have ever lived?"
\`\`\`

Eine Lösung ist, **Claude einen "Ausweg" zu geben** — Claude mitteilen, dass es ablehnen darf zu antworten, wenn es die Antwort nicht mit Sicherheit kennt:

\`\`\`
Prompt: "What are the names of the three largest hippos that have ever lived? If you don't know, say 'I don't know'."
\`\`\`

Im nächsten Beispiel enthält ein langes Dokument "Ablenkungsinformationen", die fast, aber nicht ganz relevant für die Frage sind. **Ohne Hilfe beim Prompting fällt Claude auf die Ablenkung herein**.

Eine gute Methode: **Claude anweisen, zuerst Belege zu sammeln**, bevor es antwortet. Wir sagen Claude, relevante Zitate zu extrahieren und die Antwort darauf zu stützen.

**Hinweis:** Es ist Best Practice, die Frage **nach** dem Text oder Dokument zu stellen.

#### Bonustipp

Manchmal können Halluzinationen durch Senken der **Temperatur** von Claudes Antworten behoben werden. Temperatur misst die Kreativität/Variabilität zwischen 0 und 1. Temperatur 0 erzeugt fast deterministische Antworten; höhere Werte liefern variablere Antworten. Mehr dazu [hier](https://docs.anthropic.com/claude/reference/messages_post).
  `,
  exercises: [
    {
      id: 'ex-8-1',
      title: 'Übung 8.1 — Beyoncé-Halluzination',
      description:
        'Ändere den **Prompt**, um Claudes Halluzination zu beheben, indem du Claude einen Ausweg gibst. (Renaissance ist Beyoncés siebtes Studioalbum, nicht das achte.)\n\nFühre den Prompt zunächst aus, um zu sehen, was Claude halluziniert.',
      defaultPrompt: 'In what year did star performer Beyonce release her eighth studio album?',
      defaultSystemPrompt: '',
      editableFields: ['prompt'],
      hint: 'Die Bewertung sucht nach "I do not", "I don\'t" oder "Unfortunately" in der Antwort. Was soll Claude tun, wenn es die Antwort nicht kennt?',
      grade: (text: string): boolean => {
        const contains =
          /i do not/i.test(text) ||
          /i don't/i.test(text) ||
          /unfortunately/i.test(text);
        const doesNotContain = !/2022/i.test(text);
        return contains && doesNotContain;
      },
    },
    {
      id: 'ex-8-2',
      title: 'Übung 8.2 — Prospekt-Halluzination',
      description:
        'Ändere den **Prompt**, um Claudes Halluzination zu beheben, indem du nach Zitaten fragst. Die korrekte Antwort ist, dass die Abonnentenzahl um das 49-fache gestiegen ist.\n\nDer Prompt enthält ein langes Matterport-SEC-Dokument. Lass Claude zuerst Belege sammeln, bevor es antwortet.',
      defaultPrompt:
        'From December 2018 to December 2022, by what amount did Matterport\'s subscribers grow?\n\n<document>\nMatterport SEC filing 10-K 2023\nOur subscribers have grown approximately 49-fold from December 31, 2018 to December 31, 2022. Our revenue increased by approximately 22% to $136.1 million for the year ended December 31, 2022, from approximately $111.2 million for the year ended December 31, 2021.\n</document>',
      defaultSystemPrompt: '',
      editableFields: ['prompt'],
      hint: 'Die Bewertung sucht nach "49-fold" in der Antwort. Lass Claude zuerst relevante Zitate extrahieren und prüfen, ob diese ausreichend Belege für die Antwort liefern.',
      grade: (text: string): boolean => {
        return /49-fold/i.test(text);
      },
    },
  ],
};

export default chapter;
