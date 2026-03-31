import type { Chapter } from '@/lib/types';
import chapter01 from './chapter-01';
import chapter02 from './chapter-02';
import chapter03 from './chapter-03';
import chapter04 from './chapter-04';
import chapter05 from './chapter-05';
import chapter06 from './chapter-06';
import chapter07 from './chapter-07';
import chapter08 from './chapter-08';
import chapter09 from './chapter-09';

export const CHAPTERS: Chapter[] = [
  chapter01,
  chapter02,
  chapter03,
  chapter04,
  chapter05,
  chapter06,
  chapter07,
  chapter08,
  chapter09,
];

export function getChapter(slug: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.slug === slug);
}
