import { useState, type FormEvent } from 'react';

interface ManualEntryFormProps {
  status: 'idle' | 'loading' | 'error';
  error: string | null;
  onSubmit: (input: { url?: string; rawText?: string }) => void;
}

function looksLikeUrl(value: string): boolean {
  try {
    new URL(value.trim());
    return true;
  } catch {
    return false;
  }
}

export function ManualEntryForm({ status, error, onSubmit }: ManualEntryFormProps) {
  const [text, setText] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    if (looksLikeUrl(trimmed)) {
      onSubmit({ url: trimmed });
    } else {
      onSubmit({ rawText: trimmed });
    }
    setText('');
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <h2 className="text-sm font-semibold text-slate-700">Paste a Link or Note</h2>
      <p className="mt-0.5 text-xs text-slate-400">
        Paste an article URL or a messy note — it'll be parsed into a row automatically.
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          disabled={status === 'loading'}
          rows={2}
          placeholder="https://example.com/article or a quick note about what you read…"
          className="w-full resize-none rounded border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-indigo-400"
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={status === 'loading' || !text.trim()}
            className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'loading' ? 'Parsing…' : 'Add to table'}
          </button>
          {status === 'error' && <span className="text-sm text-rose-600">{error}</span>}
        </div>
      </form>
    </div>
  );
}
