import { Router } from 'express';
import type { LearningRow } from '../../src/types';
import { generateRowId } from '../../src/utils/id';
import { getContentParser, getRepository } from '../config';
import { simulateUpstreamCall } from '../utils/simulateLatency';

export const articlesRouter = Router();

articlesRouter.get('/', async (_req, res) => {
  const rows = await getRepository().list();
  res.json(rows);
});

articlesRouter.post('/', async (req, res) => {
  const body = req.body as Omit<LearningRow, 'id' | 'createdAt' | 'statusUpdatedAt'>;
  const now = new Date().toISOString();
  const row: LearningRow = {
    ...body,
    id: generateRowId(),
    createdAt: now,
    statusUpdatedAt: now,
  };
  const created = await getRepository().create(row);
  res.status(201).json(created);
});

articlesRouter.post('/parse', async (req, res) => {
  try {
    await simulateUpstreamCall('Could not parse that input right now. Please try again.');
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    return;
  }

  const { url, rawText } = req.body as { url?: string; rawText?: string };

  let parsed;
  try {
    parsed = await getContentParser().parse({ url, rawText });
  } catch (error) {
    res.status(502).json({
      error: error instanceof Error ? error.message : 'Could not parse that input right now.',
    });
    return;
  }

  const now = new Date().toISOString();
  const row: LearningRow = {
    id: generateRowId(),
    url: url ?? '',
    status: 'To Read',
    createdAt: now,
    statusUpdatedAt: now,
    ...parsed,
  };

  const created = await getRepository().create(row);
  res.status(201).json(created);
});

articlesRouter.patch('/:id', async (req, res) => {
  const patch = req.body as Partial<LearningRow>;
  const updated = await getRepository().update(req.params.id, patch);
  if (!updated) {
    res.status(404).json({ error: 'Row not found' });
    return;
  }
  res.json(updated);
});

articlesRouter.delete('/:id', async (req, res) => {
  const deleted = await getRepository().delete(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Row not found' });
    return;
  }
  res.status(204).end();
});
