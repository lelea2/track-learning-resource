import { useState, type KeyboardEvent } from 'react';

interface LongTextCellProps {
  value: string;
  onCommit: (value: string) => void;
  ariaLabel: string;
}

/**
 * Like EditableCell but for multi-point content (e.g. OpenAI's detailed
 * keyTakeaway summary) that shouldn't be squashed onto one truncated line.
 * Preview clamps to a few lines instead of one; editing uses a textarea.
 */
export function LongTextCell({ value, onCommit, ariaLabel }: LongTextCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function startEditing() {
    setDraft(value);
    setIsEditing(true);
  }

  function commit() {
    setIsEditing(false);
    onCommit(draft);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Escape') {
      setDraft(value);
      setIsEditing(false);
    }
  }

  if (isEditing) {
    return (
      <textarea
        autoFocus
        aria-label={ariaLabel}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        rows={5}
        className="w-full resize-y rounded border border-indigo-400 bg-white px-1.5 py-1 text-sm text-slate-900 outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      title={value}
      className="block w-full whitespace-pre-line rounded px-1.5 py-1 text-left text-sm text-slate-700 hover:bg-slate-100 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]"
    >
      {value === '' ? <span className="text-slate-400">—</span> : value}
    </button>
  );
}
