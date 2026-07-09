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

  it('derives source from the URL host', () => {
    const result = parseArticleInput({ url: 'https://dev.to/author/some-post' });
    expect(result.source).toBe('dev.to');
  });

  it('strips a leading www. from the derived source', () => {
    const result = parseArticleInput({ url: 'https://www.smashingmagazine.com/some-post' });
    expect(result.source).toBe('smashingmagazine.com');
  });

  it('falls back to "Manual" when there is no URL', () => {
    const result = parseArticleInput({ rawText: 'Just a note, no link' });
    expect(result.source).toBe('Manual');
  });

  it('falls back to "Manual" for an unparseable URL', () => {
    const result = parseArticleInput({ url: 'not a real url' });
    expect(result.source).toBe('Manual');
  });
});
