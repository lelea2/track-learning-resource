import express from 'express';
import { articlesRouter } from './routes/articles';
import { suggestionsRouter } from './routes/suggestions';

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/articles', articlesRouter);
  app.use('/api/suggestions', suggestionsRouter);

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 3001;
  console.log('[index] environment:', {
    SERVER_PORT: process.env.SERVER_PORT ?? '(default 3001)',
    DB_PROVIDER: process.env.DB_PROVIDER ?? '(default memory)',
    LLM_PROVIDER: process.env.LLM_PROVIDER ?? '(default mock)',
    OPENAI_MODEL: process.env.OPENAI_MODEL ?? '(default gpt-4o-mini)',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'set' : 'not set',
  });
  createApp().listen(port, () => {
    console.log(`AI Learning Radar API listening on http://localhost:${port}`);
  });
}
