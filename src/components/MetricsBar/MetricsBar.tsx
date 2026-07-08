import type { SummaryMetrics } from '../../utils/metrics';

interface MetricsBarProps {
  metrics: SummaryMetrics;
}

export function MetricsBar({ metrics }: MetricsBarProps) {
  const tiles = [
    { label: 'Total articles', value: metrics.total },
    { label: 'To Read', value: metrics.toReadCount },
    { label: 'Completed', value: metrics.completedCount },
    { label: 'High priority', value: metrics.highPriorityCount },
    { label: "Today's study time", value: `${metrics.estimatedStudyMinutesToday} min` },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
          <div className="text-xs text-slate-400">{tile.label}</div>
          <div className="mt-0.5 text-xl font-semibold text-slate-800">{tile.value}</div>
        </div>
      ))}
    </div>
  );
}
