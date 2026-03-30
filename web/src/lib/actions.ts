'use server';

import { CHAPTERS } from '@/data/chapters';

/** Look up the grade function by exerciseId (chapterId embedded in the ID format "ex-N-M") */
export async function gradeExercise(exerciseId: string, response: string): Promise<boolean> {
  for (const chapter of CHAPTERS) {
    const exercise = chapter.exercises.find((ex) => ex.id === exerciseId);
    if (exercise) {
      return exercise.grade(response);
    }
  }
  // Unknown exercise — treat as ungraded (pass-through)
  return true;
}
