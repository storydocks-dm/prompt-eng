// web/src/lib/types.ts

export interface Exercise {
  id: string;
  title: string;
  /** Markdown description shown above the editable fields */
  description: string;
  /** Initial value for the user-editable PROMPT field */
  defaultPrompt: string;
  /** Initial value for the user-editable SYSTEM_PROMPT field. Empty string = field hidden */
  defaultSystemPrompt: string;
  /** Which fields the participant should edit */
  editableFields: Array<'prompt' | 'systemPrompt'>;
  /** Plain-text hint shown on demand */
  hint: string;
  /** Variable values substituted into {VAR_NAME} placeholders before sending to API */
  variables?: Record<string, string>;
  /** Returns true when the response counts as correct */
  grade: (response: string) => boolean;
}

/** Serializable subset of Exercise — safe to pass from Server to Client Components */
export type SerializableExercise = Omit<Exercise, 'grade'>;

export interface Chapter {
  slug: string;
  /** Display number: "00", "01", "02", ... */
  number: string;
  title: string;
  level: 'setup' | 'beginner' | 'intermediate' | 'advanced' | 'appendix';
  /** Full lesson body as a Markdown string */
  lessonMarkdown: string;
  exercises: Exercise[];
}

export interface CompleteRequest {
  prompt: string;
  systemPrompt?: string;
}

export interface CompleteResponse {
  text: string;
  error?: string;
}
