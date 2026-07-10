import type { ChatAgent, ChatAgentMessage } from './ChatAgent';

const API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';

/**
 * ChatAgent backed by OpenAI's Chat Completions API, called directly over
 * fetch rather than the `openai` SDK to avoid an extra dependency for a
 * single JSON-mode call. Reads OPENAI_API_KEY / OPENAI_MODEL lazily (at
 * construction) so importing this module never requires the key — only
 * actually selecting LLM_PROVIDER=openai does.
 */
export class OpenAIChatAgent implements ChatAgent {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey = process.env.OPENAI_API_KEY, model = process.env.OPENAI_MODEL ?? DEFAULT_MODEL) {
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required when LLM_PROVIDER=openai.');
    }
    this.apiKey = apiKey;
    this.model = model;
  }

  async complete(messages: ChatAgentMessage[]): Promise<string> {
    const startedAt = Date.now();
    console.log(
      `[OpenAIChatAgent] calling ${this.model} with ${messages.length} messages (${messages.reduce((n, m) => n + m.content.length, 0)} chars)`,
    );

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    });

    console.log(`[OpenAIChatAgent] response status ${response.status} after ${Date.now() - startedAt}ms`);

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI request failed (${response.status}): ${body.slice(0, 300)}`);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    console.log('[OpenAIChatAgent] usage:', data.usage);

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI response had no content.');
    }
    return content;
  }
}
