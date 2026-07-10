import { useState, type FormEvent } from 'react';

interface ManualEntryFormProps {
  status: 'idle' | 'loading' | 'error';
  error: string | null;
  onSubmit: (input: { url?: string; rawText?: string; title?: string }) => void;
}

type EntryMode = 'url' | 'note';

function isValidUrl(value: string): boolean {
  try {
    new URL(value.trim());
    return true;
  } catch {
    return false;
  }
}

export function ManualEntryForm({ status, error, onSubmit }: ManualEntryFormProps) {
  const [mode, setMode] = useState<EntryMode>('url');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  function switchMode(next: EntryMode) {
    setMode(next);
    setTitle('');
    setText('');
    setValidationError(null);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const titleOverride = title.trim() || undefined;

    if (mode === 'url') {
      if (!isValidUrl(trimmed)) {
        setValidationError('Enter a valid URL, e.g. https://example.com/article');
        return;
      }
      onSubmit({ url: trimmed, title: titleOverride });
    } else {
      onSubmit({ rawText: trimmed, title: titleOverride });
    }
    setValidationError(null);
    setTitle('');
    setText('');
  }

  return (
    <div className="w-full rounded-lg border border-slate-200 bg-white p-3">
      <h2 className="text-sm font-semibold text-slate-700">Paste a Link or Note</h2>
      <p className="mt-0.5 text-xs text-slate-400">
        Paste an article URL or a messy note — it'll be parsed into a row automatically.
      </p>

      <div className="mt-3 inline-flex rounded-md border border-slate-200 p-0.5 text-sm">
        <button
          type="button"
          onClick={() => switchMode('url')}
          aria-pressed={mode === 'url'}
          className={`rounded px-3 py-1 font-medium ${
            mode === 'url' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          URL
        </button>
        <button
          type="button"
          onClick={() => switchMode('note')}
          aria-pressed={mode === 'note'}
          className={`rounded px-3 py-1 font-medium ${
            mode === 'note' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          Note
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={status === 'loading'}
          placeholder={
            mode === 'note' ? 'Document title (optional) — attached to the note' : 'Title (optional)'
          }
          className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-indigo-400"
        />
        {mode === 'url' ? (
          <input
            type="url"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              if (validationError) setValidationError(null);
            }}
            disabled={status === 'loading'}
            placeholder="https://example.com/article"
            className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-indigo-400"
          />
        ) : (
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            disabled={status === 'loading'}
            rows={3}
            placeholder="A quick note about what you read…"
            className="w-full resize-none rounded border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-indigo-400"
          />
        )}
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={status === 'loading' || !text.trim()}
            className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'loading' ? 'Parsing…' : 'Add to table'}
          </button>
          {validationError && <span className="text-sm text-rose-600">{validationError}</span>}
          {!validationError && status === 'error' && (
            <span className="text-sm text-rose-600">{error}</span>
          )}
        </div>
      </form>
    </div>
  );
}
