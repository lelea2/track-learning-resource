import type { Difficulty, LearningFocus, Priority } from '../../src/types';

export interface ContentParserInput {
  url?: string;
  rawText?: string;
  title?: string;
  topicOverride?: LearningFocus;
}

export interface ContentParserResult {
  title: string;
  topic: LearningFocus;
  difficulty: Difficulty;
  priority: Priority;
  estimatedTime: number;
  interviewRelevance: number;
  keyTakeaway: string;
  nextAction: string;
}

export interface ContentParser {
  parse(input: ContentParserInput): Promise<ContentParserResult>;
}
