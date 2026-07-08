import type { LearningRow, StudyPlan } from '../../types';
import { LEARNING_FOCUS_LABELS } from '../../types';

interface StudyPlanPanelProps {
  studyPlan: StudyPlan;
}

const SLOTS: { key: keyof StudyPlan; label: string }[] = [
  { key: 'highPriority', label: 'High priority' },
  { key: 'practicalCoding', label: 'Practical coding' },
  { key: 'leadershipSystemDesign', label: 'Leadership / system design' },
];

function PlanSlot({ label, row }: { label: string; row: LearningRow | null }) {
  return (
    <div className="rounded border border-slate-100 bg-slate-50 px-2.5 py-2">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      {row ? (
        <>
          <a
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 block truncate text-sm font-medium text-indigo-700 hover:underline"
            title={row.title}
          >
            {row.title}
          </a>
          <div className="mt-0.5 text-xs text-slate-500">
            {LEARNING_FOCUS_LABELS[row.topic]} · {row.estimatedTime} min
          </div>
        </>
      ) : (
        <div className="mt-0.5 text-sm text-slate-400">Nothing available yet</div>
      )}
    </div>
  );
}

export function StudyPlanPanel({ studyPlan }: StudyPlanPanelProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Today's Study Plan</h2>
        <span className="text-xs text-slate-400">
          {studyPlan.totalEstimatedMinutes} min total
        </span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {SLOTS.map((slot) => (
          <PlanSlot
            key={slot.key}
            label={slot.label}
            row={studyPlan[slot.key] as LearningRow | null}
          />
        ))}
      </div>
    </div>
  );
}
