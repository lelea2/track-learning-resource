import { parseArticleInput } from '../../src/utils/parseArticleInput';
import type { ContentParser, ContentParserInput, ContentParserResult } from './ContentParser';

/**
 * Deterministic stand-in for a real LLM call. Delegates to the same
 * heuristics the Phase 1 client used directly (topic inference + priority
 * scoring + hash-derived fields) — same input always produces the same
 * output, no network calls, fully reproducible for demo/testing.
 */
export class MockContentParser implements ContentParser {
  async parse(input: ContentParserInput): Promise<ContentParserResult> {
    return parseArticleInput(input);
  }
}
