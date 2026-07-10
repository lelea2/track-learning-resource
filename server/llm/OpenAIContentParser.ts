import {
  DIFFICULTY_OPTIONS,
  LEARNING_FOCUS_LABELS,
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

type ParseMode = 'url' | 'note';

interface ModelOutput {
  title?: string;
  summary?: string;
  topic?: string;
  difficulty?: string;
  priority?: string;
  estimatedTime?: number;
  interviewRelevance?: number;
  keyTakeaway?: string;
  nextAction?: string;
}

const TOPIC_GUIDE = LEARNING_FOCUS_OPTIONS.map(
  (key) => `- "${key}": ${LEARNING_FOCUS_LABELS[key]}`,
).join('\n');

const RESPONSE_SHAPE = `Respond with strict JSON only (no prose, no markdown fences) matching this
shape:
{
  "title": string,
  "summary": string,
  "topic": one of ${JSON.stringify(LEARNING_FOCUS_OPTIONS)},
  "difficulty": one of ${JSON.stringify(DIFFICULTY_OPTIONS)},
  "priority": one of ${JSON.stringify(PRIORITY_OPTIONS)},
  "estimatedTime": integer,
  "interviewRelevance": integer,
  "keyTakeaway": string,
  "nextAction": string
}`;

/** Used when the input is a URL — content was fetched from the live page. */
const URL_SYSTEM_PROMPT = `You are an assistant that reads technical articles for a
software engineer prepping for interviews and catalogs them for a learning
tracker. You are given the actual fetched content of the article at the
given URL — base every field ONLY on that content, not on the title or URL
alone.

Work through these steps:
1. Read the content and write a concise 2-4 sentence summary of what it
   actually covers.
2. From that summary, pick the single best-matching topic (use the key, not
   the label):
${TOPIC_GUIDE}
3. From the same summary, grade how difficult the material is for a working
   software engineer: one of ${JSON.stringify(DIFFICULTY_OPTIONS)}.
   Beginner = introductory/definitional, Intermediate = assumes working
   knowledge, Advanced = assumes deep familiarity or covers edge cases/internals.
4. Extract detailed key takeaways that summarize the article as a whole
   (keyTakeaway) — write 3-5 concrete, specific points a reader should
   remember, each grounded in specifics from the content (names, numbers,
   techniques, tradeoffs), not generic restatements of the title. Format
   keyTakeaway as those points joined with newlines, each prefixed with
   "- ", so it reads as a short scannable summary rather than one sentence.
5. Suggest a short, concrete nextAction for someone studying this.
6. Estimate priority (${JSON.stringify(PRIORITY_OPTIONS)}) and
   interviewRelevance (0-100) for interview prep value, and estimatedTime
   in minutes (5-90) to read/study it.

${RESPONSE_SHAPE}`;

/**
 * Used when the input is a pasted note — there's no URL to fetch, the text
 * below IS the user's own note verbatim. The job here is to condense and
 * classify what they already wrote, not to analyze an external article.
 */
const NOTE_SYSTEM_PROMPT = `You are an assistant that helps a software engineer prepping for
interviews catalog their own scratch notes into a learning tracker. You are
given a note the user pasted in themselves — base every field ONLY on that
note's content, not on any assumed external source.

Work through these steps:
1. Read the note and write a concise 2-4 sentence summary of what it says.
2. From that summary, pick the single best-matching topic (use the key, not
   the label):
${TOPIC_GUIDE}
3. From the same summary, grade how difficult the material is for a working
   software engineer: one of ${JSON.stringify(DIFFICULTY_OPTIONS)}.
   Beginner = introductory/definitional, Intermediate = assumes working
   knowledge, Advanced = assumes deep familiarity or covers edge cases/internals.
4. Write keyTakeaway as a faithful, condensed summary of the note itself —
   restate what the user already wrote in their own note more concisely, in
   their voice, grounded in the specifics they actually included. If the
   note covers multiple distinct points, format keyTakeaway as those points
   joined with newlines, each prefixed with "- "; if it's a single point, a
   short paragraph is fine. Never invent details the note doesn't contain.
5. Suggest a short, concrete nextAction for someone studying this.
6. Estimate priority (${JSON.stringify(PRIORITY_OPTIONS)}) and
   interviewRelevance (0-100) for interview prep value, and estimatedTime
   in minutes (5-90) to review/study it.

${RESPONSE_SHAPE}`;

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
    const mode: ParseMode = input.url ? 'url' : 'note';
    console.log('[OpenAIContentParser] parse() called with', {
      mode,
      url: input.url,
      hasRawText: Boolean(input.rawText),
      title: input.title,
      topicOverride: input.topicOverride,
    });

    const content = await gatherContent(input);
    const source = mode === 'url' ? getSiteHost(input.url) ?? MANUAL_SOURCE : MANUAL_SOURCE;
    console.log(
      `[OpenAIContentParser] gathered ${content.length} chars in "${mode}" mode (source=${source})`,
    );
    console.log(`[OpenAIContentParser] content preview: ${content.slice(0, 300)}${content.length > 300 ? '…' : ''}`);

    const systemPrompt = mode === 'url' ? URL_SYSTEM_PROMPT : NOTE_SYSTEM_PROMPT;
    const raw = await this.agent.complete([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: buildUserMessage(input, content, mode) },
    ]);
    console.log('[OpenAIContentParser] raw agent response:', raw);

    const parsed = parseModelOutput(raw);
    console.log('[OpenAIContentParser] model summary:', parsed.summary);
    console.log(
      `[OpenAIContentParser] topic="${parsed.topic}" (overridden by=${input.topicOverride ?? 'none'}) difficulty="${parsed.difficulty}"`,
    );

    const result: ContentParserResult = {
      title: input.title?.trim() || parsed.title?.trim() || source,
      source,
      topic: input.topicOverride ?? normalizeTopic(parsed.topic),
      difficulty: normalizeDifficulty(parsed.difficulty),
      priority: normalizePriority(parsed.priority),
      estimatedTime: clampNumber(parsed.estimatedTime, 5, 180, 20),
      interviewRelevance: clampNumber(parsed.interviewRelevance, 0, 100, 50),
      keyTakeaway: parsed.keyTakeaway?.trim() ?? '',
      nextAction: parsed.nextAction?.trim() || 'Review and note the key takeaway',
    };
    console.log('[OpenAIContentParser] normalized result:', result);

    return result;
  }
}

async function gatherContent(input: ContentParserInput): Promise<string> {
  if (input.url) return fetchPageText(input.url);
  if (input.rawText) return input.rawText;
  throw new Error('Provide a URL or note text to parse.');
}

function buildUserMessage(input: ContentParserInput, content: string, mode: ParseMode): string {
  const contentLabel = mode === 'url' ? 'Content' : 'Note';
  return [
    input.title ? `Known title: ${input.title}` : null,
    input.topicOverride ? `Preferred topic (use this exactly): ${input.topicOverride}` : null,
    `${contentLabel}:\n${content}`,
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
