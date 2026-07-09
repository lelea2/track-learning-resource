export type LearningFocus =
  | 'react-performance'
  | 'frontend-system-design'
  | 'typescript'
  | 'ai-coding-agents'
  | 'accessibility'
  | 'airtable-data-modeling';

export type StudyStatus =
  | 'To Read'
  | 'Reading'
  | 'Summarized'
  | 'Practiced'
  | 'Done';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type Priority = 'Low' | 'Medium' | 'High';

/**
 * The site an article came from — derived from the article's URL host
 * (e.g. "dev.to", "reactdevelopment.substack.com") wherever a URL exists,
 * so this is open-ended rather than a fixed enum. "Manual" is the only
 * non-hostname value, used when a row has no URL to derive one from (a
 * raw-text note, or a blank row added via "+ Add row").
 */
export type ArticleSource = string;

export interface ArticleItem {
  id: string;
  title: string;
  source: ArticleSource;
  url: string;
}

export interface LearningRow extends ArticleItem {
  topic: LearningFocus;
  difficulty: Difficulty;
  priority: Priority;
  status: StudyStatus;
  estimatedTime: number; // minutes
  interviewRelevance: number; // 0-100
  keyTakeaway: string;
  nextAction: string;
  createdAt: string; // ISO timestamp
  statusUpdatedAt: string; // ISO timestamp — equals createdAt until status changes at least once
}

export interface StudyPlan {
  highPriority: LearningRow | null;
  practicalCoding: LearningRow | null;
  leadershipSystemDesign: LearningRow | null;
  totalEstimatedMinutes: number;
}

export const LEARNING_FOCUS_OPTIONS: readonly LearningFocus[] = [
  'react-performance',
  'frontend-system-design',
  'typescript',
  'ai-coding-agents',
  'accessibility',
  'airtable-data-modeling',
];

export const STUDY_STATUS_OPTIONS: readonly StudyStatus[] = [
  'To Read',
  'Reading',
  'Summarized',
  'Practiced',
  'Done',
];

export const DIFFICULTY_OPTIONS: readonly Difficulty[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
];

export const PRIORITY_OPTIONS: readonly Priority[] = ['Low', 'Medium', 'High'];

export const LEARNING_FOCUS_LABELS: Record<LearningFocus, string> = {
  'react-performance': 'React Performance',
  'frontend-system-design': 'Frontend System Design',
  typescript: 'TypeScript',
  'ai-coding-agents': 'AI Coding Agents',
  accessibility: 'Accessibility',
  'airtable-data-modeling': 'Airtable-style Data Modeling',
};
