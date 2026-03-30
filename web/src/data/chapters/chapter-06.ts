import type { Chapter } from '@/lib/types';

const chapter: Chapter = {
  slug: 'precognition',
  number: '06',
  title: 'Precognition (Thinking Step by Step)',
  level: 'intermediate',
  lessonMarkdown: `
## Lesson

If someone woke you up and immediately started asking you several complicated questions that you had to respond to right away, how would you do? Probably not as good as if you were given time to **think through your answer first**.

Guess what? Claude is the same way.

**Giving Claude time to think step by step sometimes makes Claude more accurate**, particularly for complex tasks. However, **thinking only counts when it's out loud**. You cannot ask Claude to think but output only the answer - in this case, no thinking has actually occurred.

### Examples

In the prompt below, it's clear to a human reader that the second sentence belies the first. But **Claude takes the word "unrelated" too literally**.

\`\`\`
Prompt: "Is this movie review sentiment positive or negative?

This movie blew my mind with its freshness and originality. In totally unrelated news, I have been living under a rock since the year 1900."
\`\`\`

To improve Claude's response, let's **allow Claude to think things out first before answering**. We do that by literally spelling out the steps that Claude should take in order to process and think through its task. Along with a dash of role prompting, this empowers Claude to understand the review more deeply.

\`\`\`
System Prompt: "You are a savvy reader of movie reviews."

Prompt: "Is this review sentiment positive or negative? First, write the best arguments for each side in <positive-argument> and <negative-argument> XML tags, then answer.

This movie blew my mind with its freshness and originality. In totally unrelated news, I have been living under a rock since 1900."
\`\`\`

**Claude is sometimes sensitive to ordering**. This example is on the frontier of Claude's ability to understand nuanced text, and when we swap the order of the arguments from the previous example so that negative is first and positive is second, this changes Claude's overall assessment to positive.

In most situations (but not all, confusingly enough), **Claude is more likely to choose the second of two options**, possibly because in its training data from the web, second options were more likely to be correct.

**Letting Claude think can shift Claude's answer from incorrect to correct**. It's that simple in many cases where Claude makes mistakes!

Let's go through an example where Claude's answer is incorrect to see how asking Claude to think can fix that.

\`\`\`
Prompt: "Name a famous movie starring an actor who was born in the year 1956."
\`\`\`

Let's fix this by asking Claude to think step by step, this time in \`<brainstorm>\` tags.

\`\`\`
Prompt: "Name a famous movie starring an actor who was born in the year 1956. First brainstorm about some actors and their birth years in <brainstorm> tags, then give your answer."
\`\`\`
  `,
  exercises: [
    {
      id: 'ex-6-1',
      title: 'Exercise 6.1 — Classifying Emails',
      description:
        'In this exercise, we\'ll be instructing Claude to sort emails into the following categories:\n- (A) Pre-sale question\n- (B) Broken or defective item\n- (C) Billing question\n- (D) Other (please explain)\n\nChange the **Prompt** to make Claude output the correct classification and ONLY the classification. Your answer needs to **include the letter (A - D) of the correct choice, with the parentheses, as well as the name of the category**.\n\nThe email to classify is already provided as `{email}` in the prompt. Claude will evaluate: "Hi -- My Mixmaster4000 is producing a strange noise when I operate it. It also smells a bit smoky and plasticky, like burning electronics. I need a replacement."',
      defaultPrompt: 'Please classify this email as either green or blue: {email}',
      defaultSystemPrompt: '',
      editableFields: ['prompt', 'systemPrompt'],
      hint: 'The grading function is looking for the correct categorization letter + the closing parenthesis and the first letter of the name of the category, such as "C) B" or "B) B" etc.\n\nLet\'s take this exercise step by step:\n1. Include the four categories directly in the prompt. Be sure to include the parenthetical letters.\n2. Try to cut down on superfluous text so that Claude immediately answers with the classification and ONLY the classification.\n3. Claude may still be incorrectly categorizing. Fix this by telling Claude to include the full category name in its answer.\n4. Be sure that you still have {email} somewhere in your prompt template.',
      grade: (text: string): boolean => {
        // The grading checks for category letter + closing paren + first letter of category name
        // For the first test email (broken Mixmaster), correct answer is B) Broken
        return /B\) B/i.test(text);
      },
    },
    {
      id: 'ex-6-2',
      title: 'Exercise 6.2 — Email Classification Formatting',
      description:
        'We\'re going to refine the output of the above prompt to yield an answer formatted exactly how we want it.\n\nUse your favorite output formatting technique to make Claude wrap JUST the letter of the correct classification in `<answer></answer>` tags. For instance, the answer to the first email should contain the exact string `<answer>B</answer>`.',
      defaultPrompt: 'Please classify this email as either green or blue: {email}',
      defaultSystemPrompt: '',
      editableFields: ['prompt', 'systemPrompt'],
      hint: 'The grading function is looking for only the correct letter wrapped in <answer> tags, such as "<answer>B</answer>". Sometimes the simplest way is to give Claude an example of how you want its output to look. Just don\'t forget to wrap your example in <example></example> tags! And don\'t forget that if you prefill Claude\'s response with anything, Claude won\'t actually output that as part of its response.',
      grade: (text: string): boolean => {
        return /<answer>[A-D]<\/answer>/i.test(text);
      },
    },
  ],
};

export default chapter;
