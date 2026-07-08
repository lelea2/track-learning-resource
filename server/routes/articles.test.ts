import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';

vi.mock('../utils/simulateLatency', () => ({
  simulateUpstreamCall: vi.fn().mockResolvedValue(undefined),
}));

let app: Express;

beforeEach(async () => {
  vi.resetModules();
  const { createApp } = await import('../index');
  app = createApp();
});

describe('GET /api/articles', () => {
  it('returns the seeded rows', async () => {
    const response = await request(app).get('/api/articles');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });
});

describe('POST /api/articles', () => {
  it('creates a row and assigns id/createdAt', async () => {
    const payload = {
      title: 'New row',
      source: 'Manual',
      url: '',
      topic: 'typescript',
      difficulty: 'Beginner',
      priority: 'Low',
      status: 'To Read',
      estimatedTime: 10,
      interviewRelevance: 50,
      keyTakeaway: '',
      nextAction: '',
    };

    const response = await request(app).post('/api/articles').send(payload);

    expect(response.status).toBe(201);
    expect(response.body.id).toBeTruthy();
    expect(response.body.createdAt).toBeTruthy();
    expect(response.body.title).toBe('New row');
  });
});

describe('PATCH /api/articles/:id', () => {
  it('updates an existing row', async () => {
    const list = await request(app).get('/api/articles');
    const targetId = list.body[0].id as string;

    const response = await request(app)
      .patch(`/api/articles/${targetId}`)
      .send({ title: 'Edited via test' });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Edited via test');
  });

  it('404s for an unknown id', async () => {
    const response = await request(app)
      .patch('/api/articles/does-not-exist')
      .send({ title: 'x' });
    expect(response.status).toBe(404);
  });
});

describe('DELETE /api/articles/:id', () => {
  it('deletes an existing row', async () => {
    const list = await request(app).get('/api/articles');
    const targetId = list.body[0].id as string;

    const response = await request(app).delete(`/api/articles/${targetId}`);
    expect(response.status).toBe(204);

    const after = await request(app).get('/api/articles');
    expect(after.body.find((row: { id: string }) => row.id === targetId)).toBeUndefined();
  });

  it('404s for an unknown id', async () => {
    const response = await request(app).delete('/api/articles/does-not-exist');
    expect(response.status).toBe(404);
  });
});

describe('POST /api/articles/parse', () => {
  it('parses input and creates a row', async () => {
    const response = await request(app)
      .post('/api/articles/parse')
      .send({ rawText: 'Notes on GraphQL federation' });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Notes on GraphQL federation');
    expect(response.body.source).toBe('Manual');
    expect(response.body.id).toBeTruthy();
  });

  it('surfaces upstream failures as 502', async () => {
    const { simulateUpstreamCall } = await import('../utils/simulateLatency');
    vi.mocked(simulateUpstreamCall).mockRejectedValueOnce(new Error('simulated failure'));

    const response = await request(app).post('/api/articles/parse').send({ rawText: 'x' });
    expect(response.status).toBe(502);
    expect(response.body.error).toBe('simulated failure');
  });
});
