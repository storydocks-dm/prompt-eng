'use client';
import { useState } from 'react';
import type { SerializableExercise, CompleteRequest, CompleteResponse } from '@/lib/types';
import { gradeExercise } from '@/lib/actions';
import { markExerciseSolved } from '@/lib/progress';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  exercise: SerializableExercise;
}

export default function ExerciseCell({ exercise }: Props) {
  const [prompt, setPrompt] = useState(exercise.defaultPrompt);
  const [systemPrompt, setSystemPrompt] = useState(exercise.defaultSystemPrompt);
  const [response, setResponse] = useState('');
  const [graded, setGraded] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    setLoading(true);
    setError('');
    setGraded(null);
    try {
      const body: CompleteRequest = { prompt, systemPrompt };
      const res = await fetch('/api/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data: CompleteResponse = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResponse(data.text);
        const result = await gradeExercise(exercise.id, data.text);
        setGraded(result);
        if (result) {
          markExerciseSolved(exercise.id);
          window.dispatchEvent(new Event('progress-updated'));
        }
      }
    } catch {
      setError('Netzwerkfehler. Bitte erneut versuchen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-stone-200 rounded-xl p-5 mb-6 bg-white">
      <h3 className="font-semibold text-stone-800 mb-2">{exercise.title}</h3>

      <div className="prose prose-sm prose-stone max-w-none mb-4">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{exercise.description}</ReactMarkdown>
      </div>

      {exercise.editableFields.includes('systemPrompt') && (
        <div className="mb-3">
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
            System Prompt
          </label>
          <textarea
            className="w-full border border-stone-300 rounded-lg p-3 font-mono text-sm resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="System-Prompt hier eingeben..."
          />
        </div>
      )}

      <div className="mb-3">
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
          Prompt
        </label>
        <textarea
          className={`w-full border border-stone-300 rounded-lg p-3 font-mono text-sm resize-y min-h-[100px] focus:outline-none focus:ring-2 focus:ring-orange-400 ${
            !exercise.editableFields.includes('prompt') ? 'bg-stone-50 text-stone-400' : ''
          }`}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Prompt hier eingeben..."
          readOnly={!exercise.editableFields.includes('prompt')}
        />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={run}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
        >
          {loading ? 'Lädt...' : '▶ Ausführen'}
        </button>
        <button
          onClick={() => setShowHint(!showHint)}
          className="text-sm text-stone-500 hover:text-stone-700 underline"
        >
          {showHint ? 'Hinweis ausblenden' : 'Hinweis'}
        </button>
      </div>

      {showHint && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-sm text-amber-800">
          {exercise.hint}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Claudes Antwort
            </span>
            {graded !== null && (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  graded ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}
              >
                {graded ? 'Korrekt gelöst' : 'Noch nicht korrekt'}
              </span>
            )}
          </div>
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 max-h-64 overflow-y-auto prose prose-sm prose-stone max-w-none prose-pre:bg-stone-900 prose-code:text-xs">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
