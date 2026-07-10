import { useEffect } from 'react';
import type { ToastMessage } from '../../state/useLearningTable';

interface ToastStackProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const AUTO_DISMISS_MS = 5000;

function Toast({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === 'success';

  return (
    <div
      role="status"
      className={`flex w-80 items-start gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-lg ${
        isSuccess ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'
      }`}
    >
      <span aria-hidden="true" className="mt-0.5 shrink-0">
        {isSuccess ? '✓' : '⚠'}
      </span>
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 rounded p-0.5 text-current opacity-60 hover:opacity-100"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </button>
    </div>
  );
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
