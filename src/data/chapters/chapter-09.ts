import type { Chapter } from '@/lib/types';

const chapter: Chapter = {
  slug: 'complex-prompts',
  number: '09',
  title: 'Komplexe Prompts von Grund auf',
  level: 'advanced',
  lessonMarkdown: `
## Lektion

Herzlichen Glückwunsch zum letzten Kapitel! Jetzt ist es Zeit, alles zusammenzufügen und zu lernen, wie man **einzigartige und komplexe Prompts erstellt**.

Im Folgenden verwenden wir eine **empfohlene Struktur für komplexe Prompts**. Im weiteren Verlauf zeigen wir branchenspezifische Prompts und erklären, wie sie ähnlich aufgebaut sind.

**Hinweis:** **Nicht jeder Prompt benötigt alle Elemente** der folgenden Struktur. Experimentiere — probiere Elemente ein- und auszuschalten und schau, wie sich das auf Claudes Antwort auswirkt. Es ist in der Regel **besser, zuerst viele Prompt-Elemente zu verwenden und den Prompt danach zu verfeinern**.

### Beispiel — Karriere-Coach-Chatbot

Die folgende Struktur kombiniert mehrere Prompt-Engineering-Elemente. **Die Reihenfolge ist für einige Elemente wichtig**, für andere nicht. Wenn du dich an diese Reihenfolge hältst, ist das ein guter Ausgangspunkt.

Ziel: Claude als freundlichen Karriere-Coach einzusetzen.

Empfohlene Reihenfolge der Prompt-Elemente:

1. **Aufgabenkontext** — Rolle und übergeordnetes Ziel (früh im Prompt)
2. **Tonkontext** — Wie Claude kommunizieren soll
3. **Eingabedaten** — Zu verarbeitende Daten in XML-Tags
4. **Beispiele** — Mindestens eine ideale Antwort in \`<example></example>\`-Tags
5. **Detaillierte Aufgabenbeschreibung und Regeln** — Spezifische Anweisungen und "Auswege"
6. **Unmittelbare Aufgabe** — Konkrete nächste Aktion mit Nutzervariablen (gegen Ende)
7. **Präkognition** — Bitte Claude, schrittweise zu denken (gegen Ende)
8. **Output-Formatierung** — Format angeben (gegen Ende)
9. **Vorausfüllen** — Claudes Antwort beginnen, um das Verhalten zu steuern

### Beispiel — Rechtsdienstleistungen

**Prompts in juristischen Berufen können sehr komplex sein** aufgrund der Notwendigkeit:
- Lange Dokumente zu parsen
- Komplexe Themen zu behandeln
- Output sehr spezifisch zu formatieren
- Mehrstufige Analyseprozesse zu folgen

Wir haben **die Reihenfolge einiger Elemente geändert**, um zu zeigen, dass die Prompt-Struktur flexibel sein kann!

**Prompt Engineering ist wissenschaftliches Ausprobieren**. Experimentiere, mische und kombiniere Elemente, und finde heraus, was für dich am besten funktioniert.
  `,
  exercises: [
    {
      id: 'ex-9-1',
      title: 'Übung 9.1 — Finanzdienstleistungs-Chatbot',
      description:
        'Erstelle einen komplexen Prompt für einen Finanzanwendungsfall: **Claude soll Steuerinformationen analysieren und eine Nutzerfrage zu einer 83(b)-Wahl beantworten**.\n\nDein Prompt soll Claude anweisen, als Steuerberater zu agieren, das bereitgestellte Steuerdokument zu verwenden (referenziere `{TAX_CODE}` im Prompt), die Nutzerfrage zu beantworten (referenziere `{QUESTION}`) und relevante Zitate vor der Antwort anzuführen.\n\nDie Übung prüft, ob dein Prompt eine Antwort mit `<quotes>`- und `<answer>`-Tags erzeugt.',
      defaultPrompt: '',
      defaultSystemPrompt: '',
      editableFields: ['prompt', 'systemPrompt'],
      hint: 'Strukturiere deinen Prompt mit diesen Elementen:\n1. Aufgabenkontext — sage Claude, dass es ein Steuerberater ist.\n2. Eingabedaten — füge das Steuerdokument mit `{TAX_CODE}` in `<docs>`-Tags ein.\n3. Beispiele — zeige ein Beispiel für ein Frage/Antwort-Paar mit `<quotes>`- und `<answer>`-Tags.\n4. Aufgabenbeschreibung — weise Claude an, zuerst relevante Zitate in `<quotes></quotes>`-Tags zu sammeln, dann in `<answer></answer>`-Tags zu antworten.\n5. Unmittelbare Aufgabe — füge `{QUESTION}` gegen Ende ein.',
      variables: {
        TAX_CODE: `83(b) Election — Overview\n\nSection 83(b) of the Internal Revenue Code allows employees and founders who receive restricted stock or other property subject to a vesting schedule to elect to pay income tax on the fair market value of the property at the time of grant, rather than at the time of vesting.\n\nKey provisions:\n- The election must be filed with the IRS within 30 days of the grant date.\n- The election is irrevocable once made.\n- If the property is later forfeited, no deduction is allowed for taxes already paid.\n- The fair market value at grant is treated as ordinary income; any subsequent appreciation is taxed as capital gain.\n- Long-term capital gains treatment applies if the property is held for more than one year after the grant date.\n\nBenefits of an 83(b) election:\n- Starts the capital gains holding period immediately.\n- Locks in a lower tax basis if the property's value is expected to increase significantly.\n- Particularly valuable for early-stage startup founders receiving stock at a very low valuation.\n\nRisks:\n- If the company fails or the stock declines in value, the taxpayer has overpaid taxes.\n- Taxes are owed even if the stock cannot be sold (illiquidity risk).`,
        QUESTION: 'Should I file an 83(b) election for my startup founder shares, and what is the deadline?',
      },
      grade: (text: string): boolean => {
        return /<quotes>/i.test(text) && /<answer>/i.test(text);
      },
    },
    {
      id: 'ex-9-2',
      title: 'Übung 9.2 — Codebot',
      description:
        'Schreibe einen Prompt für einen **Coding-Assistenz- und Lehr-Bot**, der Code liest und Korrekturen anleitet.\n\nDer Bot soll als Sokrates-Tutor agieren: Probleme im Code identifizieren, jedes Problem in `<issue>`-Tags setzen und den Nutzer leiten, ohne die vollständige Lösung zu verraten. Referenziere `{CODE}` als Platzhalter für den zu analysierenden Code.\n\nDie Übung prüft, ob die Antwort `<issue>`- und `<response>`-Tags enthält.',
      defaultPrompt: '',
      defaultSystemPrompt: '',
      editableFields: ['prompt', 'systemPrompt'],
      hint: 'Strukturiere deinen Prompt mit:\n1. Aufgabenkontext — Claude ist "Codebot", ein hilfreicher Coding-Assistent.\n2. Tonkontext — Claude agiert als Sokrates-Tutor.\n3. Aufgabenbeschreibung — Probleme identifizieren, jedes in `<issue>`-Tags setzen, dann eine leitende Antwort in `<response>`-Tags schreiben. KEINE vollständige Lösung geben.\n4. Beispiele — zeige ein kurzes Beispiel mit fehlerhaftem Code und `<issue>`- und `<response>`-Tags.\n5. Eingabedaten — füge `{CODE}` in `<code>`-Tags ein.\n6. Unmittelbare Aufgabe — bitte Claude, Probleme zu finden und die Sokrates-Antwort zu schreiben.',
      variables: {
        CODE: `def calculate_average(numbers):\n    total = 0\n    for num in numbers:\n        total += num\n    return total / len(numbers)\n\ndef get_letter_grade(score):\n    if score >= 90:\n        return "A"\n    elif score >= 80:\n        return "B"\n    elif score >= 70:\n        return "C"\n    elif score >= 60:\n        return "D"\n    else:\n        return "F"\n\nscores = [85, 92, 78, 0, 95]\nprint("Average:", calculate_average(scores))\nprint("Grade:", get_letter_grade(calculate_average([])))\nprint("Done")`,
      },
      grade: (text: string): boolean => {
        return /<issue>/i.test(text) && /<response>/i.test(text);
      },
    },
  ],
};

export default chapter;
