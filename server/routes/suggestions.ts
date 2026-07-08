import { Router } from 'express';
import type { LearningFocus, LearningRow } from '../../src/types';
import { generateRowId } from '../../src/utils/id';
import { getContentParser, getRepository } from '../config';
import { simulateUpstreamCall } from '../utils/simulateLatency';
import { SUGGESTION_SOURCES } from '../fixtures/suggestionSources';

export const suggestionsRouter = Router();

suggestionsRouter.post('/', async (req, res) => {
  const { focus } = req.body as { focus?: LearningFocus };
  if (!focus || !(focus in SUGGESTION_SOURCES)) {
    res.status(400).json({ error: 'A valid learning focus is required.' });
    return;
  }

  try {
    await simulateUpstreamCall(
      'Could not reach the suggestion source right now. Please try again.',
    );
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    return;
  }

  const parser = getContentParser();
  const repository = getRepository();
  const raw = SUGGESTION_SOURCES[focus];
  const now = new Date().toISOString();

  const created: LearningRow[] = [];
  for (const item of raw) {
    const parsed = await parser.parse({
      title: item.title,
      url: item.url,
      topicOverride: focus,
    });
    const row: LearningRow = {
      id: generateRowId(),
      source: item.source,
      url: item.url,
      status: 'To Read',
      createdAt: now,
      ...parsed,
    };
    created.push(await repository.create(row));
  }

  res.status(201).json(created);
});
