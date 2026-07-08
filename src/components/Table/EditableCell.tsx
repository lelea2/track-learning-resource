import { useState, type KeyboardEvent } from 'react';

interface EditableCellProps {
  value: string | number;
  type: 'text' | 'number';
  onCommit: (value: string | number) => void;
  ariaLabel: string;
}

export function EditableCell({ value, type, onCommit, ariaLabel }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  function startEditing() {
    setDraft(String(value));
    setIsEditing(true);
  }

  function commit() {
    setIsEditing(false);
    if (type === 'number') {
      const parsed = Number(draft);
      onCommit(Number.isFinite(parsed) ? parsed : value);
    } else {
      onCommit(draft);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    } else if (event.key === 'Escape') {
      setDraft(String(value));
      setIsEditing(false);
    }
  }

  if (isEditing) {
    return (
      <input
        autoFocus
        aria-label={ariaLabel}
        type={type === 'number' ? 'number' : 'text'}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className="w-full rounded border border-indigo-400 bg-white px-1.5 py-1 text-sm text-slate-900 outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      className="w-full truncate rounded px-1.5 py-1 text-left text-sm text-slate-700 hover:bg-slate-100"
      title={String(value)}
    >
      {value === '' ? <span className="text-slate-400">—</span> : value}
    </button>
  );
}
