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

describe('POST /api/suggestions', () => {
  it('returns parsed rows for a valid focus and persists them', async () => {
    const response = await request(app).post('/api/suggestions').send({ focus: 'typescript' });

    expect(response.status).toBe(201);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].topic).toBe('typescript');

    const list = await request(app).get('/api/articles');
    const persisted = list.body.some(
      (row: { id: string }) => row.id === response.body[0].id,
    );
    expect(persisted).toBe(true);
  });

  it('derives each row\'s source from its own URL host, not a category label', async () => {
    const response = await request(app).post('/api/suggestions').send({ focus: 'typescript' });

    expect(response.status).toBe(201);
    for (const row of response.body) {
      const expectedHost = new URL(row.url).hostname.replace(/^www\./, '');
      expect(row.source).toBe(expectedHost);
    }
  });

  it('400s for a missing focus', async () => {
    const response = await request(app).post('/api/suggestions').send({});
    expect(response.status).toBe(400);
  });

  it('400s for an invalid focus', async () => {
    const response = await request(app)
      .post('/api/suggestions')
      .send({ focus: 'not-a-real-focus' });
    expect(response.status).toBe(400);
  });

  it('surfaces upstream failures as 502', async () => {
    const { simulateUpstreamCall } = await import('../utils/simulateLatency');
    vi.mocked(simulateUpstreamCall).mockRejectedValueOnce(new Error('simulated failure'));

    const response = await request(app).post('/api/suggestions').send({ focus: 'typescript' });
    expect(response.status).toBe(502);
    expect(response.body.error).toBe('simulated failure');
  });
});
