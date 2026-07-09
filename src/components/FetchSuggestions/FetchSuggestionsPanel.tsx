import { useState } from 'react';
import type { LearningFocus } from '../../types';
import { LEARNING_FOCUS_LABELS, LEARNING_FOCUS_OPTIONS } from '../../types';

interface FetchSuggestionsPanelProps {
  status: 'idle' | 'loading' | 'error';
  error: string | null;
  onFetch: (focus: LearningFocus) => void;
}

export function FetchSuggestionsPanel({ status, error, onFetch }: FetchSuggestionsPanelProps) {
  const [focus, setFocus] = useState<LearningFocus>(LEARNING_FOCUS_OPTIONS[0]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <h2 className="text-sm font-semibold text-slate-700">Fetch Suggestions</h2>
      <p className="mt-0.5 text-xs text-slate-400">
        Pull article suggestions for a learning focus from Hacker News, DEV.to, Medium,
        and curated newsletters.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={focus}
          onChange={(event) => setFocus(event.target.value as LearningFocus)}
          disabled={status === 'loading'}
          className="rounded border border-slate-200 px-2 py-1.5 text-sm"
        >
          {LEARNING_FOCUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {LEARNING_FOCUS_LABELS[option]}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onFetch(focus)}
          disabled={status === 'loading'}
          className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'loading' ? 'Fetching…' : 'Fetch Suggestions'}
        </button>
      </div>

      {status === 'error' && (
        <div className="mt-3 flex items-center justify-between rounded border border-rose-200 bg-rose-50 px-2.5 py-2 text-sm text-rose-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => onFetch(focus)}
            className="font-medium underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
