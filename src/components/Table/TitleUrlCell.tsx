import { useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import { NoteSlideOver } from './NoteSlideOver';

interface TitleUrlCellProps {
  title: string;
  url: string;
  /** Original pasted note text, only present for rows added without a URL. */
  noteContent?: string;
  onCommitTitle: (value: string) => void;
  onCommitUrl: (value: string) => void;
  onDelete: () => void;
  /** The row's identity for building field labels, e.g. row.title || 'row'. */
  rowLabel: string;
}

/**
 * Combined Title + URL + row-actions cell: title renders as the clickable
 * link (using url as href), with edit/delete icon affordances. Keeps the
 * table to one column for what's conceptually one piece of information — an
 * article's name, where it lives, and what you can do to the row — instead
 * of a separate trailing Actions column.
 */
export function TitleUrlCell({
  title,
  url,
  noteContent,
  onCommitTitle,
  onCommitUrl,
  onDelete,
  rowLabel,
}: TitleUrlCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [titleDraft, setTitleDraft] = useState(title);
  const [urlDraft, setUrlDraft] = useState(url);
  const containerRef = useRef<HTMLDivElement>(null);

  function startEditing() {
    setTitleDraft(title);
    setUrlDraft(url);
    setIsEditing(true);
  }

  function handleDelete() {
    if (window.confirm(`Delete "${title || 'this row'}"? This can't be undone.`)) {
      onDelete();
    }
  }

  function commitAndClose() {
    setIsEditing(false);
    if (titleDraft !== title) onCommitTitle(titleDraft);
    if (urlDraft !== url) onCommitUrl(urlDraft);
  }

  function handleContainerBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget as Node | null;
    if (next && containerRef.current?.contains(next)) return;
    commitAndClose();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    } else if (event.key === 'Escape') {
      setTitleDraft(title);
      setUrlDraft(url);
      setIsEditing(false);
    }
  }

  if (isEditing) {
    return (
      <div
        ref={containerRef}
        onBlur={handleContainerBlur}
        className="flex flex-col gap-1 px-1.5 py-1"
      >
        <input
          autoFocus
          aria-label={`Title for ${rowLabel}`}
          value={titleDraft}
          onChange={(event) => setTitleDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Title"
          className="w-full rounded border border-indigo-400 bg-white px-1.5 py-1 text-sm text-slate-900 outline-none"
        />
        <input
          aria-label={`URL for ${rowLabel}`}
          value={urlDraft}
          onChange={(event) => setUrlDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://…"
          type="url"
          className="w-full rounded border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-500 outline-none focus:border-indigo-400"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 px-1.5 py-1">
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title={url}
          className="truncate text-sm font-medium text-indigo-700 hover:underline"
        >
          {title || 'Untitled'}
        </a>
      ) : (
        <span className="truncate text-sm font-medium text-slate-700">{title || 'Untitled'}</span>
      )}
      {noteContent && (
        <button
          type="button"
          onClick={() => setIsNoteOpen(true)}
          aria-label={`View note for ${rowLabel}`}
          title="View note"
          className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path
              fillRule="evenodd"
              d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5ZM6 6.75A.75.75 0 0 1 6.75 6h2.5a.75.75 0 0 1 0 1.5h-2.5A.75.75 0 0 1 6 6.75Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
      <div className="ml-auto flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          aria-label={`Edit title and URL for ${rowLabel}`}
          onClick={startEditing}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-.793.793-2.828-2.828.793-.793ZM11.379 5.793 3 14.172V17h2.828l8.38-8.379-2.83-2.828Z" />
          </svg>
        </button>
        <button
          type="button"
          aria-label={`Delete ${rowLabel}`}
          onClick={handleDelete}
          className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path
              fillRule="evenodd"
              d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      {noteContent && (
        <NoteSlideOver
          isOpen={isNoteOpen}
          title={title}
          content={noteContent}
          onClose={() => setIsNoteOpen(false)}
        />
      )}
    </div>
  );
}
