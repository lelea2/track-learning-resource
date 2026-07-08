import type { ArticleRepository } from './repository/ArticleRepository';
import { InMemoryArticleRepository } from './repository/InMemoryArticleRepository';
import type { ContentParser } from './llm/ContentParser';
import { MockContentParser } from './llm/MockContentParser';
import { learningRowFixtures } from './fixtures/learningRows';

/**
 * The only place env vars are read for provider selection — nothing
 * downstream branches on provider type. Both factories currently support a
 * single implementation; the `default` case documents the swap-in point
 * described in BUILD_PLAN.md rather than pretending it's already wired.
 *
 * Instances are memoized so every route shares the same repository — a
 * fresh instance per call would silently reset state on every request.
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
  if (contentParser) return contentParser;

  const provider = process.env.LLM_PROVIDER ?? 'mock';

  switch (provider) {
    case 'mock':
      contentParser = new MockContentParser();
      return contentParser;
    case 'openai':
      throw new Error(
        'LLM_PROVIDER=openai is not implemented yet — swap in an OpenAIContentParser here.',
      );
    default:
      throw new Error(`Unknown LLM_PROVIDER: ${provider}`);
  }
}
