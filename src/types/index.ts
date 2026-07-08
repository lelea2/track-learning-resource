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

export type ArticleSource = 'Hacker News' | 'DEV.to' | 'Medium' | 'Manual';

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

export const ARTICLE_SOURCE_OPTIONS: readonly ArticleSource[] = [
  'Hacker News',
  'DEV.to',
  'Medium',
  'Manual',
];

export const LEARNING_FOCUS_LABELS: Record<LearningFocus, string> = {
  'react-performance': 'React Performance',
  'frontend-system-design': 'Frontend System Design',
  typescript: 'TypeScript',
  'ai-coding-agents': 'AI Coding Agents',
  accessibility: 'Accessibility',
  'airtable-data-modeling': 'Airtable-style Data Modeling',
};
