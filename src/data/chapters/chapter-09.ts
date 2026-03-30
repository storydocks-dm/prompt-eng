import type { Chapter } from '@/lib/types';

const chapter: Chapter = {
  slug: 'complex-prompts',
  number: '09',
  title: 'Complex Prompts from Scratch',
  level: 'advanced',
  lessonMarkdown: `
## Lesson

Congratulations on making it to the last chapter! Now time to put everything together and learn how to **create unique and complex prompts**.

Below, you will be using a **guided structure that we recommend for complex prompts**. In latter parts of this chapter, we will show you some industry-specific prompts and explain how those prompts are similarly structured.

**Note:** **Not all prompts need every element of the following complex structure**. We encourage you to play around with and include or disinclude elements and see how it affects Claude's response. It is usually **best to use many prompt elements to get your prompt working first, then refine and slim down your prompt afterward**.

### Example — Career Coach Chatbot

The following structure combines multiple prompt engineering elements and is a good starting point for complex prompts. **The ordering matters for some elements**, not for others. We will note when best practices indicate ordering matters, but in general, **if you stick to this ordering, it will be a good start to a stellar prompt**.

For the following example, we will be building a prompt for a controlled roleplay wherein Claude takes on a situational role with a specific task. Our goal is to prompt Claude to act as a friendly career coach.

The recommended prompt element order:

1. **Task context** — Role and overarching goal (put early in the prompt)
2. **Tone context** — How Claude should communicate
3. **Input data** — Data to process, wrapped in XML tags
4. **Examples** — At least one ideal response in \`<example></example>\` tags
5. **Detailed task description and rules** — Specific instructions and any "outs"
6. **Immediate task** — Exact next action, with user variables (put near the end)
7. **Precognition** — Ask Claude to think step by step (near the end)
8. **Output formatting** — Specify format (near the end)
9. **Prefill** — Start Claude's answer to steer behavior

### Example — Legal Services

**Prompts within the legal profession can be quite complex** due to the need to:
- Parse long documents
- Deal with complex topics
- Format output in very specific ways
- Follow multi-step analytical processes

We've **changed around the ordering of a few elements** to showcase that prompt structure can be flexible!

**Prompt engineering is about scientific trial and error**. We encourage you to mix and match, move things around (the elements where ordering doesn't matter), and see what works best for you and your needs.
  `,
  exercises: [
    {
      id: 'ex-9-1',
      title: 'Exercise 9.1 — Financial Services Chatbot',
      description:
        'Build a complex prompt for a financial use-case: **Claude should analyze tax information and answer a user question about an 83(b) election**.\n\nYour prompt should instruct Claude to act as a tax accountant, use the provided tax code document (reference `{TAX_CODE}` in your prompt), answer the user\'s question (reference `{QUESTION}`), and cite relevant quotes before answering.\n\nThe exercise checks that your prompt produces a response containing `<quotes>` and `<answer>` tags.',
      defaultPrompt: '',
      defaultSystemPrompt: '',
      editableFields: ['prompt', 'systemPrompt'],
      hint: 'Structure your prompt with these elements:\n1. Task context — tell Claude it is a tax accountant.\n2. Input data — include the tax document using `{TAX_CODE}` wrapped in `<docs>` tags.\n3. Examples — provide an example of a question/answer pair with `<quotes>` and `<answer>` tags.\n4. Task description — instruct Claude to first gather relevant quotes in `<quotes></quotes>` tags, then answer in `<answer></answer>` tags.\n5. Immediate task — include `{QUESTION}` near the end.\n\nMake sure `{TAX_CODE}` and `{QUESTION}` appear somewhere in your prompt so they can be substituted.',
      grade: (text: string): boolean => {
        return /<quotes>/i.test(text) && /<answer>/i.test(text);
      },
    },
    {
      id: 'ex-9-2',
      title: 'Exercise 9.2 — Codebot',
      description:
        'Write a prompt for a **coding assistance and teaching bot** that reads code and offers guiding corrections.\n\nThe bot should act as a Socratic tutor: identify issues in the code, put each issue in `<issue>` tags, and guide the user without giving away the full solution. Reference `{CODE}` in your prompt as the placeholder for the code to analyze.\n\nThe exercise checks that your response contains `<issue>` and `<response>` tags.',
      defaultPrompt: '',
      defaultSystemPrompt: '',
      editableFields: ['prompt', 'systemPrompt'],
      hint: 'Structure your prompt with:\n1. Task context — Claude is "Codebot", a helpful coding assistant.\n2. Tone context — Claude acts as a Socratic tutor.\n3. Task description — identify issues, put each in `<issue>` tags, then write a guiding response in `<response>` tags. Do NOT give the full solution.\n4. Examples — show a short example of buggy code with `<issue>` and `<response>` tags.\n5. Input data — include `{CODE}` wrapped in `<code>` tags.\n6. Immediate task — ask Claude to find issues and write the Socratic response.',
      grade: (text: string): boolean => {
        return /<issue>/i.test(text) && /<response>/i.test(text);
      },
    },
  ],
};

export default chapter;
