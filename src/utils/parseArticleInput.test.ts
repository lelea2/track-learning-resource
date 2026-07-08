import { describe, expect, it } from 'vitest';
import { parseArticleInput } from './parseArticleInput';

describe('parseArticleInput', () => {
  it('is deterministic for the same input', () => {
    const input = {
      title: 'Building a Coding Agent Loop from Scratch',
      url: 'https://news.ycombinator.com/item?id=39812999',
    };
    expect(parseArticleInput(input)).toEqual(parseArticleInput({ ...input }));
  });

  it('derives a title from the URL slug when no title or note is given', () => {
    const result = parseArticleInput({ url: 'https://dev.to/author/react-generics-are-great' });
    expect(result.title).toBe('react generics are great');
  });

  it('derives a title from the first line of a pasted note', () => {
    const result = parseArticleInput({
      rawText: 'Notes on RSC boundaries\nSecond line of context',
    });
    expect(result.title).toBe('Notes on RSC boundaries');
  });

  it('respects a topicOverride instead of inferring', () => {
    const result = parseArticleInput({
      title: 'A totally generic headline',
      topicOverride: 'accessibility',
    });
    expect(result.topic).toBe('accessibility');
  });

  it('produces values within expected ranges', () => {
    const result = parseArticleInput({ title: 'Some article about TypeScript generics' });
    expect(result.estimatedTime).toBeGreaterThanOrEqual(10);
    expect(result.estimatedTime).toBeLessThanOrEqual(40);
    expect(result.interviewRelevance).toBeGreaterThanOrEqual(40);
    expect(result.interviewRelevance).toBeLessThanOrEqual(94);
  });
});
