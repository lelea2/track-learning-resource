import { describe, expect, it } from 'vitest';
import { InMemoryArticleRepository } from './InMemoryArticleRepository';
import { makeRow } from '../../src/test/factories';

describe('InMemoryArticleRepository', () => {
  it('lists seeded rows newest first', async () => {
    const repo = new InMemoryArticleRepository([
      makeRow({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeRow({ id: 'b', createdAt: '2026-01-02T00:00:00.000Z' }),
    ]);

    const rows = await repo.list();
    expect(rows.map((r) => r.id)).toEqual(['b', 'a']);
  });

  it('creates and retrieves a row by id', async () => {
    const repo = new InMemoryArticleRepository();
    const row = makeRow({ id: 'new' });

    await repo.create(row);
    expect(await repo.get('new')).toEqual(row);
  });

  it('returns null when getting a missing row', async () => {
    const repo = new InMemoryArticleRepository();
    expect(await repo.get('missing')).toBeNull();
  });

  it('updates a row and preserves its id', async () => {
    const repo = new InMemoryArticleRepository([makeRow({ id: 'a', title: 'Original' })]);

    const updated = await repo.update('a', { title: 'Edited' });
    expect(updated?.id).toBe('a');
    expect(updated?.title).toBe('Edited');
    expect((await repo.get('a'))?.title).toBe('Edited');
  });

  it('returns null when updating a missing row', async () => {
    const repo = new InMemoryArticleRepository();
    expect(await repo.update('missing', { title: 'x' })).toBeNull();
  });

  it('deletes a row and reports success', async () => {
    const repo = new InMemoryArticleRepository([makeRow({ id: 'a' })]);

    expect(await repo.delete('a')).toBe(true);
    expect(await repo.get('a')).toBeNull();
  });

  it('reports failure when deleting a missing row', async () => {
    const repo = new InMemoryArticleRepository();
    expect(await repo.delete('missing')).toBe(false);
  });
});
