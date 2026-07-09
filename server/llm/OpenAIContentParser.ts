import {
  DIFFICULTY_OPTIONS,
  LEARNING_FOCUS_OPTIONS,
  PRIORITY_OPTIONS,
  type Difficulty,
  type LearningFocus,
  type Priority,
} from '../../src/types';
import { getSiteHost } from '../../src/utils/siteHost';
import { MANUAL_SOURCE } from '../../src/utils/parseArticleInput';
import type { ContentParser, ContentParserInput, ContentParserResult } from './ContentParser';
import type { ChatAgent } from './agents/ChatAgent';
import { OpenAIChatAgent } from './agents/OpenAIChatAgent';
import { fetchPageText } from './fetchPageText';

interface ModelOutput {
  title?: string;
  topic?: string;
  difficulty?: string;
  priority?: string;
  estimatedTime?: number;
  interviewRelevance?: number;
  keyTakeaway?: string;
  nextAction?: string;
}

const SYSTEM_PROMPT = `You are an assistant that reads technical articles or notes for a
software engineer prepping for interviews and tags them for a learning
tracker. Given the content, respond with strict JSON only (no prose, no
markdown fences) matching this shape:
{
  "title": string,
  "topic": one of ${JSON.stringify(LEARNING_FOCUS_OPTIONS)},
  "difficulty": one of ${JSON.stringify(DIFFICULTY_OPTIONS)},
  "priority": one of ${JSON.stringify(PRIORITY_OPTIONS)},
  "estimatedTime": integer minutes to read/study, between 5 and 90,
  "interviewRelevance": integer 0-100,
  "keyTakeaway": the single most useful point, one or two sentences,
  "nextAction": a short, concrete next step for someone studying this
}`;

/**
 * Real LLM-backed ContentParser: fetches the article at the given URL (or
 * uses rawText directly), asks a ChatAgent to classify and summarize it, and
 * normalizes the response into the same shape MockContentParser produces.
 * The ChatAgent is constructor-injected rather than hardcoded so swapping
 * models/providers later means passing in a different ChatAgent, not
 * rewriting this class.
 */
export class OpenAIContentParser implements ContentParser {
  private readonly agent: ChatAgent;

  constructor(agent: ChatAgent = new OpenAIChatAgent()) {
    this.agent = agent;
  }

  async parse(input: ContentParserInput): Promise<ContentParserResult> {
    const content = await gatherContent(input);
    const source = getSiteHost(input.url) ?? MANUAL_SOURCE;

    const raw = await this.agent.complete([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserMessage(input, content) },
    ]);

    const parsed = parseModelOutput(raw);

    return {
      title: parsed.title?.trim() || input.title || source,
      source,
      topic: input.topicOverride ?? normalizeTopic(parsed.topic),
      difficulty: normalizeDifficulty(parsed.difficulty),
      priority: normalizePriority(parsed.priority),
      estimatedTime: clampNumber(parsed.estimatedTime, 5, 180, 20),
      interviewRelevance: clampNumber(parsed.interviewRelevance, 0, 100, 50),
      keyTakeaway: parsed.keyTakeaway?.trim() ?? '',
      nextAction: parsed.nextAction?.trim() || 'Review and note the key takeaway',
    };
  }
}

async function gatherContent(input: ContentParserInput): Promise<string> {
  if (input.url) return fetchPageText(input.url);
  if (input.rawText) return input.rawText;
  throw new Error('Provide a URL or note text to parse.');
}

function buildUserMessage(input: ContentParserInput, content: string): string {
  return [
    input.title ? `Known title: ${input.title}` : null,
    input.topicOverride ? `Preferred topic (use this exactly): ${input.topicOverride}` : null,
    `Content:\n${content}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function parseModelOutput(raw: string): ModelOutput {
  try {
    return JSON.parse(raw) as ModelOutput;
  } catch {
    throw new Error('Model returned invalid JSON.');
  }
}

function normalizeTopic(value: string | undefined): LearningFocus {
  return (LEARNING_FOCUS_OPTIONS as readonly string[]).includes(value ?? '')
    ? (value as LearningFocus)
    : 'typescript';
}

function normalizeDifficulty(value: string | undefined): Difficulty {
  return (DIFFICULTY_OPTIONS as readonly string[]).includes(value ?? '')
    ? (value as Difficulty)
    : 'Intermediate';
}

function normalizePriority(value: string | undefined): Priority {
  return (PRIORITY_OPTIONS as readonly string[]).includes(value ?? '')
    ? (value as Priority)
    : 'Medium';
}

function clampNumber(value: number | undefined, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}
