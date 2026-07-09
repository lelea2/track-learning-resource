export interface ChatAgentMessage {
  role: 'system' | 'user';
  content: string;
}

/**
 * Minimal seam between OpenAIContentParser and whatever actually talks to a
 * model. OpenAIContentParser only depends on this interface, not on the
 * OpenAI API directly — swapping providers (a different vendor, a different
 * model, a fake for tests) means implementing ChatAgent, not touching the
 * parser.
 */
export interface ChatAgent {
  complete(messages: ChatAgentMessage[]): Promise<string>;
}
