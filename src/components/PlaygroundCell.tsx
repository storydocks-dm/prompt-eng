'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { CompleteRequest, CompleteResponse } from '@/lib/types';

export default function PlaygroundCell() {
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    try {
      const body: CompleteRequest = { prompt, systemPrompt };
      const res = await fetch('/api/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data: CompleteResponse = await res.json();
      if (data.error) setError(data.error);
      else setResponse(data.text);
    } catch {
      setError('Netzwerkfehler.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-stone-200 rounded-xl p-5 bg-stone-50">
      <h3 className="font-semibold text-stone-700 mb-3">Freies Experimentieren</h3>
      <p className="text-sm text-stone-500 mb-4">
        Experimentiere frei mit eigenen Prompts — keine Bewertung.
      </p>
      <div className="mb-3">
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
          System Prompt (optional)
        </label>
        <textarea
          className="w-full border border-stone-300 rounded-lg p-3 font-mono text-sm resize-y min-h-[60px] bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Optionaler System-Prompt..."
        />
      </div>
      <div className="mb-3">
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
          Prompt
        </label>
        <textarea
          className="w-full border border-stone-300 rounded-lg p-3 font-mono text-sm resize-y min-h-[100px] bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Prompt eingeben..."
        />
      </div>
      <button
        onClick={run}
        disabled={loading || !prompt.trim()}
        className="bg-stone-700 hover:bg-stone-800 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
      >
        {loading ? 'Lädt...' : '▶ Ausführen'}
      </button>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {response && (
        <div className="mt-3 bg-white border border-stone-200 rounded-lg p-3 max-h-64 overflow-y-auto prose prose-sm prose-stone max-w-none prose-pre:bg-stone-900 prose-code:text-xs">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
