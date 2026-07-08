import type { LearningFocus, LearningRow } from '../types';
import { apiClient } from './client';

export function fetchSuggestions(focus: LearningFocus): Promise<LearningRow[]> {
  return apiClient.post<LearningRow[]>('/api/suggestions', { focus });
}
