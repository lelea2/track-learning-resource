import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface NoteSlideOverProps {
  isOpen: boolean;
  title: string;
  content: string;
  onClose: () => void;
}

/**
 * Right-edge slide-over for note-only rows (no URL to link out to) — shows
 * the original pasted text so it isn't otherwise inaccessible once a row is
 * created. Kept always-mounted with opacity/translate toggling (instead of
 * mount-on-open) so the slide-in transition actually animates.
 *
 * Rendered via a portal into document.body rather than in place — the table
 * cell it's triggered from sits inside a `sticky`-positioned `<td>` inside
 * an `overflow-x-auto` container, and that combination traps `position:
 * fixed` descendants into the cell's own box instead of the viewport (the
 * backdrop only covered part of the table, not the whole page). Portaling
 * out to body sidesteps that entirely.
 */
export function NoteSlideOver({ isOpen, title, content, onClose }: NoteSlideOverProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock page scroll while open so the table behind the panel is fully
  // inert (not just unclickable behind the backdrop, but un-scrollable too).
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return createPortal(
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-100 transition-opacity duration-200 ${
        isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Note: ${title || 'Untitled note'}`}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Children unmount while closed so their text isn't reachable in the
            DOM (would otherwise duplicate-match queries against the trigger
            button's own text) — the panel itself still slides via transform. */}
        {isOpen && (
          <>
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="truncate text-sm font-semibold text-slate-700">
                {title || 'Untitled note'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close note"
                className="ml-2 shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto whitespace-pre-line px-4 py-3 text-sm text-slate-700">
              {content || 'No note content was saved for this entry.'}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
