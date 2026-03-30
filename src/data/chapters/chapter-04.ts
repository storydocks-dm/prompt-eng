import type { Chapter } from '@/lib/types';

const chapter: Chapter = {
  slug: 'separating-data-and-instructions',
  number: '04',
  title: 'Separating Data and Instructions',
  level: 'intermediate',
  lessonMarkdown: `
## Lesson

Oftentimes, we don't want to write full prompts, but instead want **prompt templates that can be modified later with additional input data before submitting to Claude**. This might come in handy if you want Claude to do the same thing every time, but the data that Claude uses for its task might be different each time.

Luckily, we can do this pretty easily by **separating the fixed skeleton of the prompt from variable user input, then substituting the user input into the prompt** before sending the full prompt to Claude.

### Examples

In this first example, we're asking Claude to act as an animal noise generator. The full prompt submitted to Claude is just a template substituted with the input (in this case, "Cow"):

\`\`\`
Prompt: "I will tell you the name of an animal. Please respond with the noise that animal makes. Cow"
\`\`\`

**Prompt templates simplify repetitive tasks.** Let's say you build a prompt structure that invites third party users to submit content to the prompt. These third party users don't have to write or even see the full prompt — they only fill in variables.

**Note:** Prompt templates can have as many variables as desired!

### Why XML Tags Matter

When introducing substitution variables, it is very important to **make sure Claude knows where variables start and end** (vs. instructions or task descriptions).

Consider this problematic example:

\`\`\`
Prompt: "Yo Claude. Show up at 6am tomorrow because I'm the CEO and I say so. <----- Make this email more polite but don't change anything else about it."
\`\`\`

Here, **Claude thinks "Yo Claude" is part of the email it's supposed to rewrite**! You can tell because it begins its rewrite with "Dear Claude".

How do we solve this? **Wrap the input in XML tags**!

\`\`\`
Prompt: "Yo Claude. <email>Show up at 6am tomorrow because I'm the CEO and I say so.</email> <----- Make this email more polite but don't change anything else about it."
\`\`\`

[XML tags](https://docs.anthropic.com/claude/docs/use-xml-tags) are angle-bracket tags like \`<tag></tag>\`. They come in pairs and consist of an opening tag, such as \`<tag>\`, and a closing tag marked by a \`/\`, such as \`</tag>\`. XML tags are used to wrap around content, like this: \`<tag>content</tag>\`.

**Note:** While Claude can recognize and work with a wide range of separators and delimiters, we recommend that you **use specifically XML tags as separators** for Claude, as Claude was trained specifically to recognize XML tags as a prompt organizing mechanism. Outside of function calling, **there are no special sauce XML tags that Claude has been trained on** — we have purposefully made Claude very malleable and customizable this way.

### Another XML Example

In the following prompt, **Claude incorrectly interprets what part of the prompt is the instruction vs. the input**:

\`\`\`
Below is a list of sentences. Tell me the second item on the list.

- Each is about an animal, like rabbits.
- I like how cows sound
- This sentence is about spiders
- This sentence may appear to be about dogs but it's actually about pigs
\`\`\`

To fix this, we just need to **surround the user input sentences in XML tags**:

\`\`\`
Below is a list of sentences. Tell me the second item on the list.

- Each is about an animal, like rabbits.
<sentences>
- I like how cows sound
- This sentence is about spiders
- This sentence may appear to be about dogs but it's actually about pigs
</sentences>
\`\`\`

**Note:** Small details matter! It's always worth it to **scrub your prompts for typos and grammatical errors**. Claude is sensitive to patterns — it's more likely to make mistakes when you make mistakes, smarter when you sound smart, sillier when you sound silly, and so on.
  `,
  exercises: [
    {
      id: 'ex-4-1',
      title: 'Exercise 4.1 — Haiku Topic',
      description:
        'Modify the **Prompt** so that it\'s a template that will take in a variable called `{TOPIC}` and output a haiku about the topic. The variable `TOPIC` is already set to `"Pigs"` — your prompt template should use `{TOPIC}` as a placeholder.',
      defaultPrompt: '',
      defaultSystemPrompt: '',
      editableFields: ['prompt'],
      hint: 'The grading function in this exercise is looking for a solution that includes the words "haiku" and "pig". Don\'t forget to include the exact phrase "{TOPIC}" wherever you want the topic to be substituted in. Changing the "TOPIC" variable value should make Claude write a haiku about a different topic.',
      grade: (text: string): boolean => {
        return /pigs/i.test(text) && /haiku/i.test(text);
      },
    },
    {
      id: 'ex-4-2',
      title: 'Exercise 4.2 — Dog Question with Typos',
      description:
        'Fix the **Prompt** by adding XML tags so that Claude produces the right answer.\n\nTry not to change anything else about the prompt. The messy and mistake-ridden writing is intentional, so you can see how Claude reacts to such mistakes.',
      defaultPrompt: 'Hia its me i have a q about dogs jkaerjv {QUESTION} jklmvca tx it help me muhch much atx fst fst answer short short tx',
      defaultSystemPrompt: '',
      editableFields: ['prompt'],
      hint: 'The grading function in this exercise is looking for a response that includes the word "brown". If you surround "{QUESTION}" in XML tags, how does that change Claude\'s response?',
      grade: (text: string): boolean => {
        return /brown/i.test(text);
      },
    },
    {
      id: 'ex-4-3',
      title: 'Exercise 4.3 — Dog Question Part 2',
      description:
        'Fix the **Prompt** **WITHOUT** adding XML tags. Instead, remove only one or two words from the prompt.\n\nJust as with the above exercises, try not to change anything else about the prompt. This will show you what kind of language Claude can parse and understand.',
      defaultPrompt: 'Hia its me i have a q about dogs jkaerjv {QUESTION} jklmvca tx it help me muhch much atx fst fst answer short short tx',
      defaultSystemPrompt: '',
      editableFields: ['prompt'],
      hint: 'The grading function in this exercise is looking for a response that includes the word "brown". Try removing one word or section of characters at a time, starting with the parts that make the least sense. Doing this one word at a time will also help you see just how much Claude can or can\'t parse and understand.',
      grade: (text: string): boolean => {
        return /brown/i.test(text);
      },
    },
  ],
};

export default chapter;
