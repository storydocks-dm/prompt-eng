import { notFound } from 'next/navigation';
import { CHAPTERS, getChapter } from '@/data/chapters';
import LessonContent from '@/components/LessonContent';
import ExerciseCell from '@/components/ExerciseCell';
import PlaygroundCell from '@/components/PlaygroundCell';
import Link from 'next/link';
import type { SerializableExercise } from '@/lib/types';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return CHAPTERS.map((ch) => ({ slug: ch.slug }));
}

export default async function ChapterPage({ params }: Props) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) notFound();

  const idx = CHAPTERS.findIndex((c) => c.slug === chapter.slug);
  const prev = CHAPTERS[idx - 1];
  const next = CHAPTERS[idx + 1];

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <div className="mb-6">
        <span className="text-sm font-mono text-stone-400">{chapter.number}</span>
        <h1 className="text-2xl font-bold text-stone-900 mt-1">{chapter.title}</h1>
      </div>

      <section className="mb-10">
        <LessonContent markdown={chapter.lessonMarkdown} />
      </section>

      {chapter.exercises.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-stone-800 mb-4 pb-2 border-b border-stone-200">
            Übungen
          </h2>
          {chapter.exercises.map(({ grade: _grade, ...ex }: { grade: unknown } & SerializableExercise) => (
            <ExerciseCell key={ex.id} exercise={ex} />
          ))}
        </section>
      )}

      <section className="mb-10">
        <PlaygroundCell />
      </section>

      <div className="flex justify-between pt-6 border-t border-stone-200">
        {prev ? (
          <Link
            href={`/chapter/${prev.slug}`}
            className="text-sm text-stone-500 hover:text-orange-600 transition-colors"
          >
            ← {prev.number} {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/chapter/${next.slug}`}
            className="text-sm text-stone-500 hover:text-orange-600 transition-colors"
          >
            {next.number} {next.title} →
          </Link>
        )}
      </div>
    </div>
  );
}
