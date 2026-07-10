import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { articlesRouter } from './routes/articles';
import { suggestionsRouter } from './routes/suggestions';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// The client build (vite build → dist/) lives one level up from server/ —
// only present/served in production; dev/preview use the Vite proxy instead.
const CLIENT_DIST = path.resolve(__dirname, '../dist');

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/articles', articlesRouter);
  app.use('/api/suggestions', suggestionsRouter);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(CLIENT_DIST));
    // SPA fallback for any non-API GET (there's no client-side router today,
    // but this keeps a hard refresh / deep link from 404ing later).
    app.get(/.*/, (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        next();
        return;
      }
      res.sendFile(path.join(CLIENT_DIST, 'index.html'));
    });
  }

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  // Railway (and most PaaS providers) inject PORT and expect the app to
  // bind to it — SERVER_PORT remains the local-dev override.
  const port = Number(process.env.PORT ?? process.env.SERVER_PORT ?? 3001);
  console.log('[index] environment:', {
    NODE_ENV: process.env.NODE_ENV ?? '(default development)',
    PORT: process.env.PORT ?? '(not set)',
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
