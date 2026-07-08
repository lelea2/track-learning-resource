import type { LearningRow, StudyPlan } from '../types';

export interface SummaryMetrics {
  total: number;
  toReadCount: number;
  completedCount: number;
  highPriorityCount: number;
  estimatedStudyMinutesToday: number;
}

export function computeMetrics(rows: LearningRow[], studyPlan: StudyPlan): SummaryMetrics {
  return {
    total: rows.length,
    toReadCount: rows.filter((row) => row.status === 'To Read').length,
    completedCount: rows.filter((row) => row.status === 'Done').length,
    highPriorityCount: rows.filter((row) => row.priority === 'High').length,
    estimatedStudyMinutesToday: studyPlan.totalEstimatedMinutes,
  };
}
