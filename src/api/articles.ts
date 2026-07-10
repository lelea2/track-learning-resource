import type { LearningRow } from '../types';
import { apiClient } from './client';

export function listArticles(): Promise<LearningRow[]> {
  return apiClient.get<LearningRow[]>('/api/articles');
}

export function createArticle(
  row: Omit<LearningRow, 'id' | 'createdAt' | 'statusUpdatedAt'>,
): Promise<LearningRow> {
  return apiClient.post<LearningRow>('/api/articles', row);
}

export function updateArticle(id: string, patch: Partial<LearningRow>): Promise<LearningRow> {
  return apiClient.patch<LearningRow>(`/api/articles/${id}`, patch);
}

export function deleteArticle(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/articles/${id}`);
}

export function parseManualEntry(input: {
  url?: string;
  rawText?: string;
  title?: string;
}): Promise<LearningRow> {
  return apiClient.post<LearningRow>('/api/articles/parse', input);
}
