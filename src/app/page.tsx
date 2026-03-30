import Link from 'next/link';
import { CHAPTERS } from '@/data/chapters';

const LEVEL_LABELS: Record<string, string> = {
  setup: 'Einrichtung',
  beginner: 'Einsteiger',
  intermediate: 'Fortgeschritten',
  advanced: 'Komplex',
  appendix: 'Anhang',
};

const LEVEL_COLORS: Record<string, string> = {
  setup: 'bg-blue-50 text-blue-700 border-blue-200',
  beginner: 'bg-green-50 text-green-700 border-green-200',
  intermediate: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  advanced: 'bg-orange-50 text-orange-700 border-orange-200',
  appendix: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">
        Prompt Engineering Schulung
      </h1>
      <p className="text-stone-500 mb-10">
        Interaktives Tutorial von Anthropic — 9 Kapitel mit Übungen und automatischer Bewertung.
      </p>

      <div className="flex flex-col gap-3">
        {CHAPTERS.map((ch) => (
          <Link
            key={ch.slug}
            href={`/chapter/${ch.slug}`}
            className="flex items-center gap-4 bg-white border border-stone-200 rounded-xl px-5 py-4 hover:border-orange-400 hover:shadow-sm transition-all group"
          >
            <span className="font-mono text-sm text-stone-400 w-8 shrink-0">{ch.number}</span>
            <span className="flex-1 font-medium text-stone-800 group-hover:text-orange-600 transition-colors">
              {ch.title}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${LEVEL_COLORS[ch.level]}`}
            >
              {LEVEL_LABELS[ch.level]}
            </span>
            {ch.exercises.length > 0 && (
              <span className="text-xs text-stone-400">
                {ch.exercises.length} Übung{ch.exercises.length !== 1 ? 'en' : ''}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
