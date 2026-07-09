import { describe, expect, it, vi } from 'vitest';
import type { ChatAgent, ChatAgentMessage } from './agents/ChatAgent';

vi.mock('./fetchPageText', () => ({
  fetchPageText: vi.fn().mockResolvedValue('Fetched article body about generics.'),
}));

const { OpenAIContentParser } = await import('./OpenAIContentParser');
const { fetchPageText } = await import('./fetchPageText');

class StubAgent implements ChatAgent {
  private readonly response: string;
  lastMessages: ChatAgentMessage[] = [];

  constructor(response: string) {
    this.response = response;
  }

  async complete(messages: ChatAgentMessage[]): Promise<string> {
    this.lastMessages = messages;
    return this.response;
  }
}

describe('OpenAIContentParser', () => {
  it('normalizes a well-formed model response', async () => {
    const agent = new StubAgent(
      JSON.stringify({
        title: 'TypeScript Generics You Actually Need',
        topic: 'typescript',
        difficulty: 'Advanced',
        priority: 'High',
        estimatedTime: 25,
        interviewRelevance: 82,
        keyTakeaway: 'Constrain generics with extends rather than any.',
        nextAction: 'Refactor a util function using this pattern.',
      }),
    );
    const parser = new OpenAIContentParser(agent);

    const result = await parser.parse({ url: 'https://dev.to/author/some-post' });

    expect(result).toEqual({
      title: 'TypeScript Generics You Actually Need',
      source: 'dev.to',
      topic: 'typescript',
      difficulty: 'Advanced',
      priority: 'High',
      estimatedTime: 25,
      interviewRelevance: 82,
      keyTakeaway: 'Constrain generics with extends rather than any.',
      nextAction: 'Refactor a util function using this pattern.',
    });
  });

  it('fetches URL content and passes it to the agent', async () => {
    const agent = new StubAgent(JSON.stringify({ topic: 'typescript' }));
    const parser = new OpenAIContentParser(agent);

    await parser.parse({ url: 'https://dev.to/author/some-post' });

    expect(fetchPageText).toHaveBeenCalledWith('https://dev.to/author/some-post');
    expect(agent.lastMessages[1]?.content).toContain('Fetched article body about generics.');
  });

  it('respects a topicOverride regardless of what the model returns', async () => {
    const agent = new StubAgent(JSON.stringify({ topic: 'typescript' }));
    const parser = new OpenAIContentParser(agent);

    const result = await parser.parse({
      url: 'https://dev.to/author/some-post',
      topicOverride: 'accessibility',
    });

    expect(result.topic).toBe('accessibility');
  });

  it('falls back to safe defaults for missing/invalid fields', async () => {
    const agent = new StubAgent(JSON.stringify({}));
    const parser = new OpenAIContentParser(agent);

    const result = await parser.parse({ rawText: 'Some raw notes' });

    expect(result.topic).toBe('typescript');
    expect(result.difficulty).toBe('Intermediate');
    expect(result.priority).toBe('Medium');
    expect(result.estimatedTime).toBe(20);
    expect(result.interviewRelevance).toBe(50);
    expect(result.keyTakeaway).toBe('');
    expect(result.nextAction).toBe('Review and note the key takeaway');
    expect(result.source).toBe('Manual');
  });

  it('throws a clear error when the model returns invalid JSON', async () => {
    const agent = new StubAgent('not json');
    const parser = new OpenAIContentParser(agent);

    await expect(parser.parse({ rawText: 'Some raw notes' })).rejects.toThrow(
      'Model returned invalid JSON.',
    );
  });

  it('throws when neither a URL nor rawText is provided', async () => {
    const agent = new StubAgent(JSON.stringify({}));
    const parser = new OpenAIContentParser(agent);

    await expect(parser.parse({})).rejects.toThrow('Provide a URL or note text to parse.');
  });
});
