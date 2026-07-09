import { describe, expect, it } from 'vitest';
import { MockContentParser } from './MockContentParser';

describe('MockContentParser', () => {
  it('parses input deterministically, matching the shared heuristics', async () => {
    const parser = new MockContentParser();
    const input = { title: 'TypeScript Generics You Actually Need' };

    const first = await parser.parse(input);
    const second = await parser.parse({ ...input });

    expect(first).toEqual(second);
    expect(first.topic).toBe('typescript');
    expect(first.source).toBe('Manual');
  });

  it('derives source from the URL host', async () => {
    const parser = new MockContentParser();
    const result = await parser.parse({ url: 'https://dev.to/author/some-post' });
    expect(result.source).toBe('dev.to');
  });

  it('respects a topicOverride', async () => {
    const parser = new MockContentParser();
    const result = await parser.parse({
      title: 'A totally generic headline',
      topicOverride: 'accessibility',
    });
    expect(result.topic).toBe('accessibility');
  });
});
