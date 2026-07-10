import { describe, expect, it } from 'vitest';
import { inferTopic } from './topicInference';

describe('inferTopic', () => {
  it('detects react performance content', () => {
    expect(inferTopic('Why React Re-renders and How to Stop Them')).toBe('react-performance');
  });

  it('detects typescript content', () => {
    expect(inferTopic('TypeScript Generics You Actually Need')).toBe('typescript');
  });

  it('detects accessibility content', () => {
    expect(inferTopic('Accessible Modals Without a Library, ARIA included')).toBe(
      'accessibility',
    );
  });

  it('detects ai coding agent content', () => {
    expect(inferTopic('Building a Coding Agent Loop from Scratch with an LLM')).toBe(
      'ai-coding-agents',
    );
  });

  it('detects backend system design content', () => {
    expect(inferTopic('Rollups vs Lookups in an Airtable-style schema design')).toBe(
      'backend-system-design',
    );
  });

  it('falls back when no keywords match', () => {
    expect(inferTopic('A completely unrelated string of words')).toBe('frontend-system-design');
  });

  it('respects a custom fallback', () => {
    expect(inferTopic('A completely unrelated string of words', 'typescript')).toBe(
      'typescript',
    );
  });
});
