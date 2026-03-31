import type { Chapter } from '@/lib/types';

const chapter: Chapter = {
  slug: 'assigning-roles',
  number: '03',
  title: 'Rollen zuweisen (Role Prompting)',
  level: 'beginner',
  lessonMarkdown: `
## Lektion

Da Claude ohne expliziten Kontext keine Hintergrundinfos hat, ist es manchmal wichtig, **Claude eine bestimmte Rolle zuzuweisen (inkl. aller nötigen Kontextinfos)**. Das nennt sich Role Prompting. Je detaillierter der Rollenkontext, desto besser.

**Claudes Performance verbessert sich deutlich durch Rollen-Priming** — in vielen Bereichen wie Schreiben, Coding und Zusammenfassungen. Es ist ähnlich wie wenn Menschen dazu aufgefordert werden, "wie ein ______ zu denken". Role Prompting verändert auch Stil, Ton und Ausdrucksweise von Claudes Antworten.

**Hinweis:** Role Prompting kann sowohl im System-Prompt als auch im User-Turn eingesetzt werden.

### Beispiele

Im folgenden Beispiel gibt Claude ohne Rollen-Priming eine **sachliche und stillose Antwort** auf die Frage nach Skateboarding.

Wenn wir Claude jedoch die Rolle einer Katze zuweisen, verändert sich Claudes Perspektive — **Ton, Stil und Inhalt passen sich der neuen Rolle an**.

**Hinweis:** Als Bonustechnik kann man Claude auch den **Kontext über die Zielgruppe** mitgeben. "You are a cat" erzeugt eine ganz andere Antwort als "You are a cat talking to a crowd of skateboarders."

Ohne Role Prompting:

\`\`\`
Prompt: "In one sentence, what do you think about skateboarding?"
\`\`\`

Mit Role Prompting:

\`\`\`
System: "You are a cat."
Prompt: "In one sentence, what do you think about skateboarding?"
\`\`\`

Role Prompting kann auch dazu verwendet werden, Claudes Schreibstil anzupassen, eine bestimmte Stimme zu imitieren oder den Komplexitätsgrad der Antworten zu steuern. **Role Prompting kann Claude auch bei Mathematik- und Logikaufgaben verbessern.**

Beispiel mit einer Logikaufgabe — es gibt eine eindeutig richtige Antwort (Ja), aber ohne Rolle könnte Claude falsch liegen:

\`\`\`
Prompt: "Jack is looking at Anne. Anne is looking at George. Jack is married, George is not, and we don't know if Anne is married. Is a married person looking at an unmarried person?"
\`\`\`

Wenn wir **Claude als Logik-Bot** einsetzen, antwortet Claude korrekt:

\`\`\`
System: "You are a logic bot designed to answer complex logic problems."
Prompt: "Jack is looking at Anne. Anne is looking at George. Jack is married, George is not, and we don't know if Anne is married. Is a married person looking at an unmarried person?"
\`\`\`

**Hinweis:** Im Verlauf dieses Kurses wirst du feststellen, dass es **viele Prompt-Engineering-Techniken** gibt, die ähnliche Ergebnisse erzielen. Experimentiere und finde deinen eigenen Stil!
  `,
  exercises: [
    {
      id: 'ex-3-1',
      title: 'Übung 3.1 — Mathematik-Korrektur',
      description: `In manchen Fällen **kann Claude bei Mathematik Fehler machen**, auch bei einfachen Berechnungen. Im folgenden Beispiel bewertet Claude eine falsch gelöste Gleichung als korrekt, obwohl im zweiten Schritt ein offensichtlicher Fehler steckt.

Ändere den **Prompt** und/oder den **System-Prompt** so, dass Claude die Lösung als \`falsch\` bewertet.

\`\`\`
2x - 3 = 9
2x = 6
x = 3
\`\`\``,
      defaultPrompt: `Is this equation solved correctly below?

2x - 3 = 9
2x = 6
x = 3`,
      defaultSystemPrompt: '',
      editableFields: ['prompt', 'systemPrompt'],
      hint: 'Die Bewertung sucht nach "incorrect" oder "not correct" in der Antwort. Gib Claude eine Rolle, die es besser in Mathematik macht!',
      grade: (text: string): boolean => {
        return /incorrect/i.test(text) || /not correct/i.test(text);
      },
    },
  ],
};

export default chapter;
