import type { Chapter } from '@/lib/types';

const chapter: Chapter = {
  slug: 'formatting-output',
  number: '05',
  title: 'Formatting Output and Speaking for Claude',
  level: 'intermediate',
  lessonMarkdown: `
## Lesson

**Claude can format its output in a wide variety of ways**. You just need to ask for it to do so!

One of these ways is by using XML tags to separate out the response from any other superfluous text. You've already learned that you can use XML tags to make your prompt clearer and more parseable to Claude. It turns out, you can also ask Claude to **use XML tags to make its output clearer and more easily understandable** to humans.

### Examples

Remember the 'poem preamble problem' we solved in Chapter 2 by asking Claude to skip the preamble entirely? It turns out we can also achieve a similar outcome by **telling Claude to put the poem in XML tags**.

\`\`\`
ANIMAL = "Rabbit"
Prompt: "Please write a haiku about {ANIMAL}. Put it in <haiku> tags."
\`\`\`

Why is this something we'd want to do? Well, having the output in **XML tags allows the end user to reliably get the poem and only the poem by writing a short program to extract the content between XML tags**.

An extension of this technique is to **put the first XML tag in the \`assistant\` turn. When you put text in the \`assistant\` turn, you're basically telling Claude that Claude has already said something, and that it should continue from that point onward. This technique is called "speaking for Claude" or "prefilling Claude's response."

Below, we've done this with the first \`<haiku>\` XML tag. Notice how Claude continues directly from where we left off.

\`\`\`
USER TURN:
"Please write a haiku about Cat. Put it in <haiku> tags."

ASSISTANT TURN:
"<haiku>"
\`\`\`

Claude also excels at using other output formatting styles, notably \`JSON\`. If you want to enforce JSON output (not deterministically, but close to it), you can also prefill Claude's response with the opening bracket, \`{\`.

\`\`\`
USER TURN:
"Please write a haiku about Cat. Use JSON format with the keys as \\"first_line\\", \\"second_line\\", and \\"third_line\\"."

ASSISTANT TURN:
"{"
\`\`\`

Below is an example of **multiple input variables in the same prompt AND output formatting specification, all done using XML tags**.

\`\`\`
USER TURN:
"Hey Claude. Here is an email: <email>{EMAIL}</email>. Make this email more {ADJECTIVE}. Write the new version in <{ADJECTIVE}_email> XML tags."

ASSISTANT TURN:
"<{ADJECTIVE}_email>"
\`\`\`

#### Bonus lesson

If you are calling Claude through the API, you can pass the closing XML tag to the \`stop_sequences\` parameter to get Claude to stop sampling once it emits your desired tag. This can save money and time-to-last-token by eliminating Claude's concluding remarks after it's already given you the answer you care about.
  `,
  exercises: [
    {
      id: 'ex-5-1',
      title: 'Exercise 5.1 — Steph Curry GOAT',
      description:
        'Forced to make a choice, Claude designates Michael Jordan as the best basketball player of all time. Can we get Claude to pick someone else?\n\nChange the **System Prompt** (used as a prefill for the assistant turn) to **compel Claude to make a detailed argument that the best basketball player of all time is Stephen Curry**. Try not to change the main prompt.',
      defaultPrompt: 'Who is the best basketball player of all time? Please choose one specific player.',
      defaultSystemPrompt: '',
      editableFields: ['systemPrompt'],
      hint: 'The grading function for this exercise is looking for a response that includes the word "Warrior". Write more words in Claude\'s voice to steer Claude to act the way you want it to. For instance, instead of "Stephen Curry is the best because," you could write "Stephen Curry is the best and here are three reasons why. 1:"',
      grade: (text: string): boolean => {
        return /warrior/i.test(text);
      },
    },
    {
      id: 'ex-5-2',
      title: 'Exercise 5.2 — Two Haikus',
      description:
        'Modify the **Prompt** using XML tags so that Claude writes **two** haikus about the animal instead of just one. It should be clear where one poem ends and the other begins.',
      defaultPrompt: 'Please write a haiku about cats. Put it in <haiku> tags.',
      defaultSystemPrompt: '<haiku>',
      editableFields: ['prompt'],
      hint: 'The grading function looks for a response of over 5 lines in length that includes the words "cat" and "<haiku>". Start simple. Currently, the prompt asks Claude for one haiku. You can change that and ask for two (or even more). Then if you run into formatting issues, change your prompt to fix that after you\'ve already gotten Claude to write more than one haiku.',
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
      title: 'Exercise 5.3 — Two Haikus, Two Animals',
      description:
        'Modify the **Prompt** so that **Claude produces two haikus about two different animals**. Use `{ANIMAL1}` as a stand-in for the first substitution, and `{ANIMAL2}` as a stand-in for the second substitution. The variables are already set to "Cat" and "Dog".',
      defaultPrompt: 'Please write a haiku about Cat. Put it in <haiku> tags.',
      defaultSystemPrompt: '',
      editableFields: ['prompt'],
      hint: 'The grading function in this exercise is looking for a response that contains the words "tail", "cat", and "<haiku>". It\'s helpful to break this exercise down to several steps:\n1. Modify the initial prompt template so that Claude writes two poems.\n2. Give Claude indicators as to what the poems will be about, but instead of writing in the subjects directly (e.g., dog, cat, etc.), replace those subjects with the keywords "{ANIMAL1}" and "{ANIMAL2}".\n3. Run the prompt and make sure that the full prompt with variable substitutions has all the words correctly substituted.',
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
