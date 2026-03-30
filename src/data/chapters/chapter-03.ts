import type { Chapter } from '@/lib/types';

const chapter: Chapter = {
  slug: 'assigning-roles',
  number: '03',
  title: 'Assigning Roles (Role Prompting)',
  level: 'beginner',
  lessonMarkdown: `
## Lesson

Continuing on the theme of Claude having no context aside from what you say, it's sometimes important to **prompt Claude to inhabit a specific role (including all necessary context)**. This is also known as role prompting. The more detail to the role context, the better.

**Priming Claude with a role can improve Claude's performance** in a variety of fields, from writing to coding to summarizing. It's like how humans can sometimes be helped when told to "think like a ______". Role prompting can also change the style, tone, and manner of Claude's response.

**Note:** Role prompting can happen either in the system prompt or as part of the User message turn.

### Examples

In the example below, we see that without role prompting, Claude provides a **straightforward and non-stylized answer** when asked to give a single sentence perspective on skateboarding.

However, when we prime Claude to inhabit the role of a cat, Claude's perspective changes, and thus **Claude's response tone, style, content adapts to the new role**.

**Note:** A bonus technique you can use is to **provide Claude context on its intended audience**. Below, we could have tweaked the prompt to also tell Claude whom it should be speaking to. "You are a cat" produces quite a different response than "you are a cat talking to a crowd of skateboarders."

Without role prompting:

\`\`\`
Prompt: "In one sentence, what do you think about skateboarding?"
\`\`\`

With role prompting:

\`\`\`
System: "You are a cat."
Prompt: "In one sentence, what do you think about skateboarding?"
\`\`\`

You can use role prompting as a way to get Claude to emulate certain styles in writing, speak in a certain voice, or guide the complexity of its answers. **Role prompting can also make Claude better at performing math or logic tasks.**

For example, consider this logic problem — there is a definitive correct answer (yes), but without a role Claude may get it wrong:

\`\`\`
Prompt: "Jack is looking at Anne. Anne is looking at George. Jack is married, George is not, and we don't know if Anne is married. Is a married person looking at an unmarried person?"
\`\`\`

Now, what if we **prime Claude to act as a logic bot**? With this new role assignment, Claude gets it right:

\`\`\`
System: "You are a logic bot designed to answer complex logic problems."
Prompt: "Jack is looking at Anne. Anne is looking at George. Jack is married, George is not, and we don't know if Anne is married. Is a married person looking at an unmarried person?"
\`\`\`

**Note:** What you'll learn throughout this course is that there are **many prompt engineering techniques you can use to derive similar results**. Which techniques you use is up to you and your preference! We encourage you to **experiment to find your own prompt engineering style**.
  `,
  exercises: [
    {
      id: 'ex-3-1',
      title: 'Exercise 3.1 — Math Correction',
      description: `In some instances, **Claude may struggle with mathematics**, even simple mathematics. Below, Claude incorrectly assesses the math problem as correctly solved, even though there's an obvious arithmetic mistake in the second step.

Modify the **Prompt** and/or the **System Prompt** to make Claude grade the solution as \`incorrectly\` solved, rather than correctly solved.

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
      hint: 'The grading function in this exercise is looking for an answer that includes the words "incorrect" or "not correct". Give Claude a role that might make Claude better at solving math problems!',
      grade: (text: string): boolean => {
        return /incorrect/i.test(text) || /not correct/i.test(text);
      },
    },
  ],
};

export default chapter;
