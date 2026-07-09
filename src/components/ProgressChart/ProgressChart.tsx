import { useState } from 'react';
import type { DailyProgress } from '../../utils/progressOverTime';

interface ProgressChartProps {
  dailyProgress: DailyProgress[];
}

const CHART_HEIGHT = 140;
const MIN_SEGMENT_HEIGHT = 3;

function dayOfMonth(dateKey: string): string {
  return String(new Date(`${dateKey}T00:00:00.000Z`).getUTCDate());
}

function fullDateLabel(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00.000Z`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function ProgressChart({ dailyProgress }: ProgressChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalCompleted = dailyProgress.reduce((sum, d) => sum + d.completed, 0);
  const totalProgressed = dailyProgress.reduce((sum, d) => sum + d.progressed, 0);
  const maxTotal = Math.max(1, ...dailyProgress.map((d) => d.completed + d.progressed));
  const hasActivity = totalCompleted + totalProgressed > 0;
  const todayKey = dailyProgress[dailyProgress.length - 1]?.date;
  const hovered = hoveredIndex !== null ? dailyProgress[hoveredIndex] : null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Study Progress — Last 14 Days</h2>
          <p className="mt-0.5 text-xs text-slate-400">Based on when each article's status last changed</p>
        </div>
        {hasActivity && (
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" aria-hidden="true" />
              Completed ({totalCompleted})
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-600" aria-hidden="true" />
              Progressed ({totalProgressed})
            </span>
          </div>
        )}
      </div>

      {!hasActivity ? (
        <div className="mt-4 rounded border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
          No status changes in the last 14 days — mark an article as Reading, Summarized,
          Practiced, or Done to see progress here.
        </div>
      ) : (
        <div className="relative mt-4">
          {hovered && hoveredIndex !== null && (
            <div
              className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded border border-slate-200 bg-white px-2 py-1 text-xs shadow-md"
              style={{ left: `${((hoveredIndex + 0.5) / dailyProgress.length) * 100}%` }}
            >
              <div className="font-medium text-slate-700">{fullDateLabel(hovered.date)}</div>
              <div className="text-emerald-600">{hovered.completed} completed</div>
              <div className="text-amber-600">{hovered.progressed} progressed</div>
            </div>
          )}

          <div
            className="flex items-end gap-1 border-b border-slate-200"
            style={{ height: CHART_HEIGHT }}
          >
            {dailyProgress.map((day, index) => {
              const total = day.completed + day.progressed;
              const completedHeight =
                day.completed === 0
                  ? 0
                  : Math.max(MIN_SEGMENT_HEIGHT, (day.completed / maxTotal) * CHART_HEIGHT);
              const progressedHeight =
                day.progressed === 0
                  ? 0
                  : Math.max(MIN_SEGMENT_HEIGHT, (day.progressed / maxTotal) * CHART_HEIGHT);

              return (
                <button
                  type="button"
                  key={day.date}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onFocus={() => setHoveredIndex(index)}
                  onBlur={() => setHoveredIndex(null)}
                  aria-label={`${fullDateLabel(day.date)}: ${day.completed} completed, ${day.progressed} progressed`}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  {total === 0 ? (
                    <div className="h-0.5 w-4 rounded-full bg-slate-200" />
                  ) : (
                    <>
                      {day.progressed > 0 && (
                        <div
                          className={`w-4 bg-amber-600 ${day.completed === 0 ? 'rounded-t' : ''}`}
                          style={{ height: progressedHeight }}
                        />
                      )}
                      {day.completed > 0 && (
                        <div
                          className={`w-4 bg-emerald-600 ${day.progressed === 0 ? 'rounded-t' : ''}`}
                          style={{ height: completedHeight }}
                        />
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-1 flex gap-1">
            {dailyProgress.map((day) => (
              <div
                key={day.date}
                className={`flex-1 text-center text-[10px] ${
                  day.date === todayKey ? 'font-semibold text-slate-600' : 'text-slate-400'
                }`}
              >
                {dayOfMonth(day.date)}
              </div>
            ))}
          </div>

          <table className="sr-only">
            <caption>Study progress by day, last 14 days</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Completed</th>
                <th scope="col">Progressed</th>
              </tr>
            </thead>
            <tbody>
              {dailyProgress.map((day) => (
                <tr key={day.date}>
                  <td>{fullDateLabel(day.date)}</td>
                  <td>{day.completed}</td>
                  <td>{day.progressed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
