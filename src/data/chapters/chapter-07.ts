import type { Chapter } from '@/lib/types';

const chapter: Chapter = {
  slug: 'few-shot-prompting',
  number: '07',
  title: 'Using Examples (Few-Shot Prompting)',
  level: 'intermediate',
  lessonMarkdown: `
## Lesson

**Giving Claude examples of how you want it to behave (or how you want it not to behave) is extremely effective** for:
- Getting the right answer
- Getting the answer in the right format

This sort of prompting is also called "**few shot prompting**". You might also encounter the phrase "zero-shot" or "n-shot" or "one-shot". The number of "shots" refers to how many examples are used within the prompt.

### Examples

Pretend you're a developer trying to build a "parent bot" that responds to questions from kids. **Claude's default response is quite formal and robotic**. This is going to break a child's heart.

\`\`\`
Prompt: "Will Santa bring me presents on Christmas?"
\`\`\`

You could take the time to describe your desired tone, but it's much easier just to **give Claude a few examples of ideal responses**.

\`\`\`
Prompt: "Please complete the conversation by writing the next line, speaking as \\"A\\".
Q: Is the tooth fairy real?
A: Of course, sweetie. Wrap up your tooth and put it under your pillow tonight. There might be something waiting for you in the morning.
Q: Will Santa bring me presents on Christmas?"
\`\`\`

In the following formatting example, we could walk Claude step by step through a set of formatting instructions on how to extract names and professions and then format them exactly the way we want, or we could just **provide Claude with some correctly-formatted examples and Claude can extrapolate from there**. Note the \`<individuals>\` in the \`assistant\` turn to start Claude off on the right foot.

\`\`\`
USER TURN:
"Silvermist Hollow, a charming village, was home to an extraordinary group of individuals.
Among them was Dr. Liam Patel, a neurosurgeon...
Isabella Torres, a self-taught chef...
<individuals>
1. Dr. Liam Patel [NEUROSURGEON]
2. Olivia Chen [ARCHITECT]
3. Ethan Kovacs [MUSICIAN AND COMPOSER]
4. Isabella Torres [CHEF]
</individuals>

[second passage]...
<individuals>
1. Oliver Hamilton [CHEF]
2. Elizabeth Chen [LIBRARIAN]
...
</individuals>

[third passage to extract from]..."

ASSISTANT TURN:
"<individuals>"
\`\`\`

Claude extrapolates the pattern from the examples and formats the third passage the same way.
  `,
  exercises: [
    {
      id: 'ex-7-1',
      title: 'Exercise 7.1 — Email Formatting via Examples',
      description:
        'We\'re going to redo Exercise 6.2, but this time, we\'re going to edit the **Prompt** to use "few-shot" examples of emails + proper classification (and formatting) to get Claude to output the correct answer. We want the *last* letter of Claude\'s output to be the letter of the category.\n\nRemember the categories:\n- (A) Pre-sale question\n- (B) Broken or defective item\n- (C) Billing question\n- (D) Other (please explain)\n\nThe email to classify: "Hi -- My Mixmaster4000 is producing a strange noise when I operate it. It also smells a bit smoky and plasticky, like burning electronics. I need a replacement."',
      defaultPrompt: 'Please classify this email as either green or blue: {email}',
      defaultSystemPrompt: '',
      editableFields: ['prompt', 'systemPrompt'],
      hint: 'You\'re going to have to write some example emails and classify them for Claude (with the exact formatting you want). Here are some guidelines:\n1. Try to have at least two example emails. Claude doesn\'t need an example for all categories.\n2. Make sure your example answer formatting is exactly the format you want Claude to use. This format should make it so that Claude\'s answer ends in the letter of the category.\n3. Make sure you still have the categories listed within the prompt itself, as well as {email} as a placeholder for substitution.',
      grade: (text: string): boolean => {
        // Same grading as 6.1 -- checks for correct category letter + paren + first letter
        return /B\) B/i.test(text);
      },
    },
  ],
};

export default chapter;
