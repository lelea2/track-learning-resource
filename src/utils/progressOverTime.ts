import type { LearningRow } from '../types';

export interface DailyProgress {
  /** YYYY-MM-DD, UTC. */
  date: string;
  /** Rows whose status became "Done" this day. */
  completed: number;
  /** Rows whose status changed to something other than "Done" this day. */
  progressed: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Buckets status-change events by day (based on statusUpdatedAt) for the
 * last `days` days, oldest first. A row only counts on the day its status
 * last changed — rows still at their original status (statusUpdatedAt ===
 * createdAt) never progressed and are excluded entirely, not counted as a
 * zero-day event.
 */
export function computeDailyProgress(
  rows: LearningRow[],
  days = 14,
  now: Date = new Date(),
): DailyProgress[] {
  const buckets = new Map<string, DailyProgress>();
  for (let i = days - 1; i >= 0; i -= 1) {
    const key = toDateKey(new Date(now.getTime() - i * DAY_MS).toISOString());
    buckets.set(key, { date: key, completed: 0, progressed: 0 });
  }

  for (const row of rows) {
    if (row.statusUpdatedAt === row.createdAt) continue;
    const bucket = buckets.get(toDateKey(row.statusUpdatedAt));
    if (!bucket) continue;
    if (row.status === 'Done') {
      bucket.completed += 1;
    } else {
      bucket.progressed += 1;
    }
  }

  return [...buckets.values()];
}
