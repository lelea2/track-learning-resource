import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLearningTable } from './useLearningTable';
import { makeRow } from '../test/factories';
import type { LearningRow } from '../types';

vi.mock('../api/suggestions', () => ({
  fetchSuggestions: vi.fn(),
}));
vi.mock('../api/articles', () => ({
  listArticles: vi.fn(),
  createArticle: vi.fn(),
  updateArticle: vi.fn(),
  deleteArticle: vi.fn(),
  parseManualEntry: vi.fn(),
}));

import { fetchSuggestions } from '../api/suggestions';
import {
  createArticle,
  deleteArticle,
  listArticles,
  parseManualEntry,
  updateArticle,
} from '../api/articles';

const mockFetchSuggestions = vi.mocked(fetchSuggestions);
const mockListArticles = vi.mocked(listArticles);
const mockCreateArticle = vi.mocked(createArticle);
const mockUpdateArticle = vi.mocked(updateArticle);
const mockDeleteArticle = vi.mocked(deleteArticle);
const mockParseManualEntry = vi.mocked(parseManualEntry);

beforeEach(() => {
  // Plain CRUD is fire-and-forget in the hook (optimistic update + background
  // sync) — give update/delete a resolved default so tests that don't care
  // about the sync call itself don't trip an unhandled rejection.
  mockUpdateArticle.mockResolvedValue(makeRow());
  mockDeleteArticle.mockResolvedValue(undefined);
});

async function renderLoadedTable(seed: LearningRow[] = []) {
  mockListArticles.mockResolvedValueOnce(seed);
  const view = renderHook(() => useLearningTable());
  await waitFor(() => expect(view.result.current.initStatus).toBe('idle'));
  return view;
}

describe('useLearningTable', () => {
  it('loads rows from the server on mount', async () => {
    const { result } = await renderLoadedTable([makeRow({ id: 'a' })]);
    expect(result.current.rows.map((r) => r.id)).toEqual(['a']);
  });

  it('surfaces an error when the initial load fails', async () => {
    mockListArticles.mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useLearningTable());

    await waitFor(() => expect(result.current.initStatus).toBe('error'));
    expect(result.current.initError).toBe('offline');
  });

  it('retryInit re-fetches after an initial load failure', async () => {
    mockListArticles.mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useLearningTable());
    await waitFor(() => expect(result.current.initStatus).toBe('error'));

    mockListArticles.mockResolvedValueOnce([makeRow({ id: 'recovered' })]);
    act(() => result.current.retryInit());

    await waitFor(() => expect(result.current.initStatus).toBe('idle'));
    expect(result.current.rows.map((r) => r.id)).toEqual(['recovered']);
  });

  it('adds a server-created row to the front of the list', async () => {
    const { result } = await renderLoadedTable([]);
    mockCreateArticle.mockResolvedValueOnce(makeRow({ id: 'server-1', title: 'New row' }));

    act(() => result.current.addBlankRow());

    await waitFor(() => expect(result.current.rows).toHaveLength(1));
    expect(result.current.rows[0].id).toBe('server-1');
  });

  it('updates a row optimistically and syncs the patch to the server', async () => {
    const { result } = await renderLoadedTable([makeRow({ id: 'a', title: 'Original' })]);

    act(() => result.current.updateRow('a', { title: 'Edited' }));

    expect(result.current.rows[0].title).toBe('Edited');
    expect(mockUpdateArticle).toHaveBeenCalledWith('a', { title: 'Edited' });
  });

  it('deletes a row optimistically and syncs to the server', async () => {
    const { result } = await renderLoadedTable([makeRow({ id: 'a' }), makeRow({ id: 'b' })]);

    act(() => result.current.deleteRow('a'));

    expect(result.current.rows.map((r) => r.id)).toEqual(['b']);
    expect(mockDeleteArticle).toHaveBeenCalledWith('a');
  });

  it('applies filters to visibleRows without touching rows', async () => {
    const { result } = await renderLoadedTable([
      makeRow({ id: 'a', status: 'To Read' }),
      makeRow({ id: 'b', status: 'Done' }),
    ]);

    act(() => result.current.setFilters({ status: 'Done' }));
    expect(result.current.rows).toHaveLength(2);
    expect(result.current.visibleRows.map((r) => r.id)).toEqual(['b']);
  });

  it('applies sort to visibleRows', async () => {
    const { result } = await renderLoadedTable([
      makeRow({ id: 'a', priority: 'Low' }),
      makeRow({ id: 'b', priority: 'High' }),
    ]);

    act(() => result.current.setSort({ field: 'priority', direction: 'desc' }));
    expect(result.current.visibleRows.map((r) => r.id)).toEqual(['b', 'a']);
  });

  it('prepends fetched suggestions on success and resets loading state', async () => {
    const { result } = await renderLoadedTable([]);
    mockFetchSuggestions.mockResolvedValueOnce([makeRow({ id: 'new', title: 'Fetched row' })]);

    act(() => {
      void result.current.fetchSuggestionsForFocus('typescript');
    });
    expect(result.current.fetchStatus).toBe('loading');

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(result.current.rows.map((r) => r.id)).toEqual(['new']);
    expect(result.current.fetchError).toBeNull();
  });

  it('surfaces an error message when fetching suggestions fails', async () => {
    const { result } = await renderLoadedTable([]);
    mockFetchSuggestions.mockRejectedValueOnce(new Error('network down'));

    act(() => {
      void result.current.fetchSuggestionsForFocus('typescript');
    });

    await waitFor(() => expect(result.current.fetchStatus).toBe('error'));
    expect(result.current.fetchError).toBe('network down');
    expect(result.current.rows).toHaveLength(0);
  });

  it('adds a manually parsed row on success', async () => {
    const { result } = await renderLoadedTable([]);
    mockParseManualEntry.mockResolvedValueOnce(makeRow({ id: 'manual', title: 'Parsed note' }));

    act(() => {
      void result.current.submitManualEntry({ rawText: 'a note' });
    });
    expect(result.current.parseStatus).toBe('loading');

    await waitFor(() => expect(result.current.parseStatus).toBe('idle'));
    expect(result.current.rows.map((r) => r.id)).toEqual(['manual']);
  });

  it('surfaces an error message when manual parsing fails', async () => {
    const { result } = await renderLoadedTable([]);
    mockParseManualEntry.mockRejectedValueOnce(new Error('parse failed'));

    act(() => {
      void result.current.submitManualEntry({ rawText: 'a note' });
    });

    await waitFor(() => expect(result.current.parseStatus).toBe('error'));
    expect(result.current.parseError).toBe('parse failed');
  });
});
