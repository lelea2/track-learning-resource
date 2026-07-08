import type { LearningRow } from '../../types';
import {
  DIFFICULTY_OPTIONS,
  LEARNING_FOCUS_OPTIONS,
  LEARNING_FOCUS_LABELS,
  PRIORITY_OPTIONS,
  STUDY_STATUS_OPTIONS,
} from '../../types';

export type ColumnType = 'text' | 'number' | 'select' | 'titleUrl' | 'readonly';

export interface ColumnDef {
  key: keyof LearningRow;
  label: string;
  type: ColumnType;
  options?: readonly string[];
  optionLabels?: Record<string, string>;
  width?: string;
  /** Sticky-positioned to stay visible during horizontal scroll. */
  sticky?: boolean;
}

export const COLUMNS: ColumnDef[] = [
  { key: 'title', label: 'Title', type: 'titleUrl', width: 'min-w-72', sticky: true },
  { key: 'source', label: 'Source', type: 'readonly', width: 'min-w-28' },
  {
    key: 'topic',
    label: 'Topic',
    type: 'select',
    options: LEARNING_FOCUS_OPTIONS,
    optionLabels: LEARNING_FOCUS_LABELS,
    width: 'min-w-44',
  },
  {
    key: 'difficulty',
    label: 'Difficulty',
    type: 'select',
    options: DIFFICULTY_OPTIONS,
    width: 'min-w-32',
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'select',
    options: PRIORITY_OPTIONS,
    width: 'min-w-28',
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: STUDY_STATUS_OPTIONS,
    width: 'min-w-32',
  },
  { key: 'estimatedTime', label: 'Est. Time (min)', type: 'number', width: 'min-w-28' },
  { key: 'interviewRelevance', label: 'Interview Relevance', type: 'number', width: 'min-w-24' },
  { key: 'keyTakeaway', label: 'Key Takeaway', type: 'text', width: 'min-w-64' },
  { key: 'nextAction', label: 'Next Action', type: 'text', width: 'min-w-56' },
];
