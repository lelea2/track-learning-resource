import { useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';

interface TitleUrlCellProps {
  title: string;
  url: string;
  onCommitTitle: (value: string) => void;
  onCommitUrl: (value: string) => void;
  /** The row's identity for building field labels, e.g. row.title || 'row'. */
  rowLabel: string;
}

/**
 * Combined Title + URL cell: title renders as the clickable link (using url
 * as href), with an "edit" affordance that opens both fields for editing at
 * once. Keeps the table to one column for what's conceptually one piece of
 * information — an article's name and where it lives.
 */
export function TitleUrlCell({
  title,
  url,
  onCommitTitle,
  onCommitUrl,
  rowLabel,
}: TitleUrlCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(title);
  const [urlDraft, setUrlDraft] = useState(url);
  const containerRef = useRef<HTMLDivElement>(null);

  function startEditing() {
    setTitleDraft(title);
    setUrlDraft(url);
    setIsEditing(true);
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
      <button
        type="button"
        aria-label={`Edit title and URL for ${rowLabel}`}
        onClick={startEditing}
        className="ml-auto shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-3.5 w-3.5"
        >
          <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-.793.793-2.828-2.828.793-.793ZM11.379 5.793 3 14.172V17h2.828l8.38-8.379-2.83-2.828Z" />
        </svg>
      </button>
    </div>
  );
}
