import type { Chapter } from '@/lib/types';

const chapter: Chapter = {
  slug: 'avoiding-hallucinations',
  number: '08',
  title: 'Avoiding Hallucinations',
  level: 'advanced',
  lessonMarkdown: `
## Lesson

Some bad news: **Claude sometimes "hallucinates" and makes claims that are untrue or unjustified**. The good news: there are techniques you can use to minimize hallucinations.

Below, we'll go over a few of these techniques, namely:
- Giving Claude the option to say it doesn't know the answer to a question
- Asking Claude to find evidence before answering

However, **there are many methods to avoid hallucinations**, including many of the techniques you've already learned in this course. If Claude hallucinates, experiment with multiple techniques to get Claude to increase its accuracy.

### Examples

Here is a question about general factual knowledge in answer to which **Claude hallucinates several large hippos because it's trying to be as helpful as possible**.

\`\`\`
Prompt: "What are the names of the three largest hippos that have ever lived?"
\`\`\`

A solution we can try here is to "**give Claude an out**" -- tell Claude that it's OK for it to decline to answer, or to only answer if it actually knows the answer with certainty.

\`\`\`
Prompt: "What are the names of the three largest hippos that have ever lived? If you don't know, say 'I don't know'."
\`\`\`

In the next example, we give Claude a long document containing some "distractor information" that is almost but not quite relevant to the user's question. **Without prompting help, Claude falls for the distractor information** and gives an incorrect "hallucinated" answer.

**Note:** It's best practice to have the question at the bottom *after* any text or document.

How do we fix this? Well, a great way to reduce hallucinations on long documents is to **make Claude gather evidence first.**

In this case, we **tell Claude to first extract relevant quotes, then base its answer on those quotes**. Telling Claude to do so here makes it correctly notice that the quote does not answer the question.

#### Bonus lesson

Sometimes, Claude's hallucinations can be solved by lowering the \`temperature\` of Claude's responses. Temperature is a measurement of answer creativity between 0 and 1, with 1 being more unpredictable and less standardized, and 0 being the most consistent.

Asking Claude something at temperature 0 will generally yield an almost-deterministic answer set across repeated trials (although complete determinism is not guaranteed). Asking Claude something at temperature 1 (or gradations in between) will yield more variable answers. Learn more about temperature and other parameters [here](https://docs.anthropic.com/claude/reference/messages_post).
  `,
  exercises: [
    {
      id: 'ex-8-1',
      title: 'Exercise 8.1 — Beyonce Hallucination',
      description:
        'Modify the **Prompt** to fix Claude\'s hallucination issue by giving Claude an out. (Renaissance is Beyonce\'s seventh studio album, not her eighth.)\n\nWe suggest you run the prompt first to see what Claude hallucinates before trying to fix it.',
      defaultPrompt: 'In what year did star performer Beyonce release her eighth studio album?',
      defaultSystemPrompt: '',
      editableFields: ['prompt'],
      hint: 'The grading function is looking for a response that contains the phrase "I do not", "I don\'t", or "Unfortunately". What should Claude do if it doesn\'t know the answer?',
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
      title: 'Exercise 8.2 — Prospectus Hallucination',
      description:
        'Modify the **Prompt** to fix Claude\'s hallucination issue by asking for citations. The correct answer is that subscribers went up 49x.\n\nThe prompt includes a long Matterport SEC filing document. Make Claude show its work and gather evidence before answering.',
      defaultPrompt:
        'From December 2018 to December 2022, by what amount did Matterport\'s subscribers grow?\n\n<document>\nMatterport SEC filing 10-K 2023\nOur subscribers have grown approximately 49-fold from December 31, 2018 to December 31, 2022. Our revenue increased by approximately 22% to $136.1 million for the year ended December 31, 2022, from approximately $111.2 million for the year ended December 31, 2021.\n</document>',
      defaultSystemPrompt: '',
      editableFields: ['prompt'],
      hint: 'The grading function is looking for a response that contains the phrase "49-fold". Make Claude show its work and thought process first by extracting relevant quotes and seeing whether or not the quotes provide sufficient evidence. Refer back to the Chapter 8 Lesson if you want a refresher.',
      grade: (text: string): boolean => {
        return /49-fold/i.test(text);
      },
    },
  ],
};

export default chapter;
