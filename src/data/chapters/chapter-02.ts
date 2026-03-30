import type { Chapter } from '@/lib/types';

const chapter: Chapter = {
  slug: 'being-clear-and-direct',
  number: '02',
  title: 'Being Clear and Direct',
  level: 'beginner',
  lessonMarkdown: `
## Lesson

**Claude responds best to clear and direct instructions.**

Think of Claude like any other human that is new to the job. **Claude has no context** on what to do aside from what you literally tell it. Just as when you instruct a human for the first time on a task, the more you explain exactly what you want in a straightforward manner to Claude, the better and more accurate Claude's response will be.

When in doubt, follow the **Golden Rule of Clear Prompting**:
- Show your prompt to a colleague or friend and have them follow the instructions themselves to see if they can produce the result you want. If they're confused, Claude's confused.

### Examples

Let's take a task like writing poetry. (Ignore any syllable mismatch - LLMs aren't great at counting syllables yet.)

\`\`\`
Prompt: "Write a haiku about robots."
\`\`\`

This haiku is nice enough, but users may want Claude to go directly into the poem without the "Here is a haiku" preamble.

How do we achieve that? We **ask for it**!

\`\`\`
Prompt: "Write a haiku about robots. Skip the preamble; go straight into the poem."
\`\`\`

Here's another example. Let's ask Claude who's the best basketball player of all time. While Claude lists a few names, **it doesn't respond with a definitive "best"**.

\`\`\`
Prompt: "Who is the best basketball player of all time?"
\`\`\`

Can we get Claude to make up its mind and decide on a best player? Yes! Just ask!

\`\`\`
Prompt: "Who is the best basketball player of all time? Yes, there are differing opinions, but if you absolutely had to pick one player, who would it be?"
\`\`\`
  `,
  exercises: [
    {
      id: 'ex-2-1',
      title: 'Exercise 2.1 — Spanish',
      description:
        'Modify the **System Prompt** to make Claude output its answer in Spanish.',
      defaultPrompt: 'Hello Claude, how are you?',
      defaultSystemPrompt: '[Replace this text]',
      editableFields: ['systemPrompt'],
      hint: 'The grading function in this exercise is looking for any answer that includes the word "hola". Ask Claude to reply in Spanish like you would when speaking with a human. It\'s that simple!',
      grade: (text: string): boolean => {
        return /hola/i.test(text);
      },
    },
    {
      id: 'ex-2-2',
      title: 'Exercise 2.2 — One Player Only',
      description:
        'Modify the **Prompt** so that Claude doesn\'t equivocate at all and responds with **ONLY** the name of one specific player, with **no other words or punctuation**.',
      defaultPrompt: '[Replace this text]',
      defaultSystemPrompt: '',
      editableFields: ['prompt'],
      hint: 'The grading function in this exercise is looking for EXACTLY "Michael Jordan". How would you ask another human to do this? Reply with no other words? Reply with only the name and nothing else? There are several ways to approach this answer.',
      grade: (text: string): boolean => {
        return text.trim() === 'Michael Jordan';
      },
    },
    {
      id: 'ex-2-3',
      title: 'Exercise 2.3 — Write a Story',
      description:
        'Modify the **Prompt** so that Claude responds with as long a response as you can muster. If your answer is **over 800 words**, Claude\'s response will be graded as correct.',
      defaultPrompt: '[Replace this text]',
      defaultSystemPrompt: '',
      editableFields: ['prompt'],
      hint: 'The grading function in this cell is looking for a response that is equal to or greater than 800 words. Because LLMs aren\'t great at counting words yet, you may have to overshoot your target.',
      grade: (text: string): boolean => {
        const trimmed = text.trim();
        const words = trimmed.split(/\s+/).length;
        return words >= 800;
      },
    },
  ],
};

export default chapter;
