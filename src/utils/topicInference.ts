import type { LearningFocus } from '../types';

const TOPIC_KEYWORDS: Record<LearningFocus, string[]> = {
  'react-performance': [
    'react',
    'render',
    're-render',
    'memo',
    'virtual dom',
    'fiber',
    'performance',
    'compiler',
  ],
  'frontend-system-design': [
    'system design',
    'architecture',
    'scale',
    'micro-frontend',
    'microfrontend',
    'cdn',
    'caching',
    'boundary',
  ],
  typescript: ['typescript', 'generic', 'interface', ' ts ', 'type-safe', 'discriminated union'],
  'ai-coding-agents': [
    'agent',
    'llm',
    'prompt',
    ' ai ',
    'coding agent',
    'copilot',
    'gpt',
    'claude',
  ],
  accessibility: [
    'accessib',
    'a11y',
    'aria',
    'wcag',
    'screen reader',
    'contrast',
    'keyboard nav',
  ],
  'backend-system-design': [
    'backend',
    'back-end',
    'server-side',
    'database',
    'sql',
    'microservice',
    'distributed system',
    'api design',
    'airtable',
    'rollup',
    'lookup field',
    'many-to-many',
    'database model',
    'schema design',
  ],
  others: ['miscellaneous', 'uncategorized', 'general note'],
};

const TOPIC_ORDER: LearningFocus[] = [
  'react-performance',
  'frontend-system-design',
  'typescript',
  'ai-coding-agents',
  'accessibility',
  'backend-system-design',
  'others',
];

/**
 * Deterministic keyword-match "topic classifier" standing in for a real LLM
 * call. Counts keyword hits per topic and returns the best match; ties go to
 * whichever topic appears first in TOPIC_ORDER.
 */
export function inferTopic(
  text: string,
  fallback: LearningFocus = 'frontend-system-design',
): LearningFocus {
  const lower = ` ${text.toLowerCase()} `;
  let best: LearningFocus = fallback;
  let bestScore = 0;

  for (const topic of TOPIC_ORDER) {
    const score = TOPIC_KEYWORDS[topic].reduce(
      (acc, keyword) => acc + (lower.includes(keyword) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  }

  return best;
}
