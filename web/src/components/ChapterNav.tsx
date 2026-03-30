'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CHAPTERS } from '@/data/chapters';

const LEVEL_LABELS: Record<string, string> = {
  setup: 'Einrichtung',
  beginner: 'Einsteiger',
  intermediate: 'Fortgeschritten',
  advanced: 'Komplex',
  appendix: 'Anhang',
};

export default function ChapterNav() {
  const pathname = usePathname();
  const groups = CHAPTERS.reduce<Record<string, typeof CHAPTERS>>((acc, ch) => {
    acc[ch.level] = [...(acc[ch.level] ?? []), ch];
    return acc;
  }, {});

  return (
    <nav className="w-64 shrink-0 border-r border-stone-200 bg-stone-50 h-screen sticky top-0 overflow-y-auto p-4">
      <Link href="/" className="block mb-6">
        <span className="text-sm font-bold text-orange-600 uppercase tracking-wider">
          Prompt Engineering
        </span>
      </Link>
      {(['setup', 'beginner', 'intermediate', 'advanced', 'appendix'] as const).map((level) => {
        const chapters = groups[level];
        if (!chapters?.length) return null;
        return (
          <div key={level} className="mb-4">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
              {LEVEL_LABELS[level]}
            </p>
            {chapters.map((ch) => {
              const href = `/chapter/${ch.slug}`;
              const active = pathname === href;
              return (
                <Link
                  key={ch.slug}
                  href={href}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm mb-0.5 transition-colors ${
                    active
                      ? 'bg-orange-100 text-orange-700 font-medium'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-xs text-stone-400 font-mono w-6 shrink-0">
                    {ch.number}
                  </span>
                  <span className="truncate">{ch.title}</span>
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
