import type { LearningRow } from '../../src/types';
import type { ArticleRepository } from './ArticleRepository';

/**
 * In-memory store keyed by row id. Ships now; a future
 * SqlArticleRepository (Prisma/Drizzle over Postgres or SQLite) implements
 * the same interface, so routes/services never change when that lands.
 */
export class InMemoryArticleRepository implements ArticleRepository {
  private rows: Map<string, LearningRow>;

  constructor(seed: LearningRow[] = []) {
    this.rows = new Map(seed.map((row) => [row.id, row]));
  }

  async list(): Promise<LearningRow[]> {
    return [...this.rows.values()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async get(id: string): Promise<LearningRow | null> {
    return this.rows.get(id) ?? null;
  }

  async create(row: LearningRow): Promise<LearningRow> {
    this.rows.set(row.id, row);
    return row;
  }

  async update(id: string, patch: Partial<LearningRow>): Promise<LearningRow | null> {
    const existing = this.rows.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch, id: existing.id };
    this.rows.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.rows.delete(id);
  }
}
