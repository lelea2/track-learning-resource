import type { Difficulty, LearningFocus } from '../types';
import { DIFFICULTY_OPTIONS } from '../types';
import { hashString } from './hash';
import { inferTopic } from './topicInference';
import { scorePriority } from './priorityScoring';
import { getSiteHost } from './siteHost';

/** Fallback source label when there's no URL to derive a host from (a raw-text note). */
export const MANUAL_SOURCE = 'Manual';

export interface ParsedArticleInput {
  title?: string;
  url?: string;
  rawText?: string;
  /** Force topic instead of inferring it (used when a focus was explicitly selected, e.g. Fetch Suggestions). */
  topicOverride?: LearningFocus;
}

export interface ParsedArticleFields {
  title: string;
  source: string;
  topic: LearningFocus;
  difficulty: Difficulty;
  priority: ReturnType<typeof scorePriority>;
  estimatedTime: number;
  interviewRelevance: number;
  keyTakeaway: string;
  nextAction: string;
}

/**
 * Deterministic stand-in for a real LLM content-parsing call: same input
 * always produces the same output (see server/llm/ContentParser in
 * BUILD_PLAN.md — this mirrors what MockContentParser will do server-side).
 * Swapping to OpenAI later means implementing the same return shape.
 */
export function parseArticleInput(input: ParsedArticleInput): ParsedArticleFields {
  const title = deriveTitle(input);
  const source = getSiteHost(input.url) ?? MANUAL_SOURCE;
  const corpus = `${title} ${input.rawText ?? ''} ${input.url ?? ''}`;
  const topic = input.topicOverride ?? inferTopic(corpus);

  const hash = hashString(`${title}|${input.url ?? ''}`);
  const difficulty = DIFFICULTY_OPTIONS[hash % DIFFICULTY_OPTIONS.length];
  const interviewRelevance = 40 + (hash % 55); // 40-94
  const priority = scorePriority({ interviewRelevance, difficulty, topic });
  const estimatedTime = 10 + (hash % 4) * 10; // 10 | 20 | 30 | 40

  return {
    title,
    source,
    topic,
    difficulty,
    priority,
    estimatedTime,
    interviewRelevance,
    keyTakeaway: '',
    nextAction: 'Review and note the key takeaway',
  };
}

function deriveTitle(input: ParsedArticleInput): string {
  if (input.title) return input.title;

  if (input.rawText) {
    const firstLine = input.rawText.split('\n')[0]?.trim();
    if (firstLine) return firstLine.slice(0, 80);
  }

  if (input.url) {
    try {
      const parsed = new URL(input.url);
      const slug = parsed.pathname.split('/').filter(Boolean).pop();
      const readable = slug?.replace(/[-_]/g, ' ').replace(/\.\w+$/, '').trim();
      return readable || parsed.hostname;
    } catch {
      return input.url;
    }
  }

  return 'Untitled note';
}
