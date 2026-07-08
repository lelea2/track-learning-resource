const PRIORITY_CLASSES: Record<string, string> = {
  High: 'bg-rose-100 text-rose-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-slate-100 text-slate-600',
};

const STATUS_CLASSES: Record<string, string> = {
  'To Read': 'bg-slate-100 text-slate-600',
  Reading: 'bg-sky-100 text-sky-700',
  Summarized: 'bg-violet-100 text-violet-700',
  Practiced: 'bg-amber-100 text-amber-700',
  Done: 'bg-emerald-100 text-emerald-700',
};

const DIFFICULTY_CLASSES: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-rose-100 text-rose-700',
};

const BADGE_CLASSES_BY_COLUMN: Record<string, Record<string, string>> = {
  priority: PRIORITY_CLASSES,
  status: STATUS_CLASSES,
  difficulty: DIFFICULTY_CLASSES,
};

export function getBadgeClass(columnKey: string, value: string): string {
  return BADGE_CLASSES_BY_COLUMN[columnKey]?.[value] ?? 'bg-slate-100 text-slate-600';
}
