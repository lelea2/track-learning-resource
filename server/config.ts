import type { ArticleRepository } from './repository/ArticleRepository';
import { InMemoryArticleRepository } from './repository/InMemoryArticleRepository';
import type { ContentParser } from './llm/ContentParser';
import { MockContentParser } from './llm/MockContentParser';
import { OpenAIContentParser } from './llm/OpenAIContentParser';
import { learningRowFixtures } from './fixtures/learningRows';

/**
 * The only place env vars are read for provider selection — nothing
 * downstream branches on provider type. `DB_PROVIDER=sql`'s `default` case
 * documents the swap-in point described in BUILD_PLAN.md rather than
 * pretending it's already wired; `LLM_PROVIDER=openai` is wired.
 *
 * Instances are memoized so every route shares the same repository/parser —
 * a fresh instance per call would silently reset state on every request.
 */

let repository: ArticleRepository | null = null;
let contentParser: ContentParser | null = null;

export function getRepository(): ArticleRepository {
  if (repository) return repository;

  const provider = process.env.DB_PROVIDER ?? 'memory';

  switch (provider) {
    case 'memory':
      repository = new InMemoryArticleRepository(learningRowFixtures);
      return repository;
    case 'sql':
      throw new Error(
        'DB_PROVIDER=sql is not implemented yet — swap in a SqlArticleRepository here.',
      );
    default:
      throw new Error(`Unknown DB_PROVIDER: ${provider}`);
  }
}

export function getContentParser(): ContentParser {
  if (contentParser) {
    console.log(`[config] getContentParser() reusing memoized ${contentParser.constructor.name}`);
    return contentParser;
  }

  const provider = process.env.LLM_PROVIDER ?? 'mock';
  console.log(`[config] getContentParser() selecting provider from LLM_PROVIDER="${provider}"`);

  switch (provider) {
    case 'mock':
      console.log('[config] using MockContentParser (deterministic, no network calls)');
      contentParser = new MockContentParser();
      return contentParser;
    case 'openai':
      console.log(
        `[config] using OpenAIContentParser (model=${process.env.OPENAI_MODEL ?? 'gpt-4o-mini'}, apiKeySet=${Boolean(process.env.OPENAI_API_KEY)})`,
      );
      contentParser = new OpenAIContentParser();
      return contentParser;
    default:
      throw new Error(`Unknown LLM_PROVIDER: ${provider}`);
  }
}
