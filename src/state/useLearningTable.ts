import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type { LearningFocus, LearningRow } from '../types';
import { fetchSuggestions } from '../api/suggestions';
import {
  createArticle,
  deleteArticle,
  listArticles,
  parseManualEntry,
  updateArticle,
} from '../api/articles';
import { DEFAULT_FILTERS, filterRows, type RowFilters } from '../utils/filtering';
import { DEFAULT_SORT, sortRows, type SortState } from '../utils/sorting';
import { generateStudyPlan } from '../utils/studyPlan';
import { computeMetrics } from '../utils/metrics';
import { computeDailyProgress } from '../utils/progressOverTime';
import { MANUAL_SOURCE } from '../utils/parseArticleInput';

type AsyncStatus = 'idle' | 'loading' | 'error';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface State {
  rows: LearningRow[];
  filters: RowFilters;
  sort: SortState;
  initStatus: AsyncStatus;
  initError: string | null;
  fetchStatus: AsyncStatus;
  fetchError: string | null;
  parseStatus: AsyncStatus;
  parseError: string | null;
  toasts: ToastMessage[];
}

type Action =
  | { type: 'INIT_START' }
  | { type: 'INIT_SUCCESS'; rows: LearningRow[] }
  | { type: 'INIT_ERROR'; message: string }
  | { type: 'ADD_ROW'; row: LearningRow }
  | { type: 'UPDATE_ROW'; id: string; patch: Partial<LearningRow> }
  | { type: 'DELETE_ROW'; id: string }
  | { type: 'SET_FILTERS'; patch: Partial<RowFilters> }
  | { type: 'SET_SORT'; sort: SortState }
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; rows: LearningRow[] }
  | { type: 'FETCH_ERROR'; message: string }
  | { type: 'PARSE_START' }
  | { type: 'PARSE_SUCCESS'; row: LearningRow }
  | { type: 'PARSE_ERROR'; message: string }
  | { type: 'TOAST_ADD'; toast: ToastMessage }
  | { type: 'TOAST_DISMISS'; id: string };

const initialState: State = {
  rows: [],
  filters: DEFAULT_FILTERS,
  sort: DEFAULT_SORT,
  initStatus: 'loading',
  initError: null,
  fetchStatus: 'idle',
  fetchError: null,
  parseStatus: 'idle',
  parseError: null,
  toasts: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INIT_START':
      return { ...state, initStatus: 'loading', initError: null };
    case 'INIT_SUCCESS':
      return { ...state, initStatus: 'idle', initError: null, rows: action.rows };
    case 'INIT_ERROR':
      return { ...state, initStatus: 'error', initError: action.message };
    case 'ADD_ROW':
      return { ...state, rows: [action.row, ...state.rows] };
    case 'UPDATE_ROW':
      return {
        ...state,
        rows: state.rows.map((row) =>
          row.id === action.id ? { ...row, ...action.patch } : row,
        ),
      };
    case 'DELETE_ROW':
      return { ...state, rows: state.rows.filter((row) => row.id !== action.id) };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.patch } };
    case 'SET_SORT':
      return { ...state, sort: action.sort };
    case 'FETCH_START':
      return { ...state, fetchStatus: 'loading', fetchError: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        fetchStatus: 'idle',
        fetchError: null,
        rows: [...action.rows, ...state.rows],
      };
    case 'FETCH_ERROR':
      return { ...state, fetchStatus: 'error', fetchError: action.message };
    case 'PARSE_START':
      return { ...state, parseStatus: 'loading', parseError: null };
    case 'PARSE_SUCCESS':
      return {
        ...state,
        parseStatus: 'idle',
        parseError: null,
        rows: [action.row, ...state.rows],
      };
    case 'PARSE_ERROR':
      return { ...state, parseStatus: 'error', parseError: action.message };
    case 'TOAST_ADD':
      return { ...state, toasts: [...state.toasts, action.toast] };
    case 'TOAST_DISMISS':
      return { ...state, toasts: state.toasts.filter((toast) => toast.id !== action.id) };
    default:
      return state;
  }
}

function blankRowPayload(): Omit<LearningRow, 'id' | 'createdAt' | 'statusUpdatedAt'> {
  return {
    title: 'New row',
    source: MANUAL_SOURCE,
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
}

/**
 * Owns all table state and talks to the server for persistence. Plain CRUD
 * (add/update/delete) applies optimistically — the reducer updates first,
 * the API call fires in the background — since the server has no
 * artificial latency for those. Fetch Suggestions and manual-entry parsing
 * keep an explicit loading/error cycle because the server simulates real
 * upstream latency + failures for those two endpoints specifically.
 */
export function useLearningTable() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadArticles = useCallback(() => {
    let cancelled = false;
    dispatch({ type: 'INIT_START' });
    listArticles()
      .then((rows) => {
        if (!cancelled) dispatch({ type: 'INIT_SUCCESS', rows });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          dispatch({
            type: 'INIT_ERROR',
            message: error instanceof Error ? error.message : 'Something went wrong.',
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => loadArticles(), [loadArticles]);

  const visibleRows = useMemo(
    () => sortRows(filterRows(state.rows, state.filters), state.sort),
    [state.rows, state.filters, state.sort],
  );

  const studyPlan = useMemo(() => generateStudyPlan(state.rows), [state.rows]);
  const metrics = useMemo(() => computeMetrics(state.rows, studyPlan), [state.rows, studyPlan]);
  const dailyProgress = useMemo(() => computeDailyProgress(state.rows), [state.rows]);
  // Source is derived from each row's URL host (see parseArticleInput), so
  // it's open-ended rather than a fixed enum — the filter's options come
  // from whatever sources are actually present in the data.
  const sourceOptions = useMemo(
    () => [...new Set(state.rows.map((row) => row.source))].sort((a, b) => a.localeCompare(b)),
    [state.rows],
  );

  const addBlankRow = useCallback(() => {
    createArticle(blankRowPayload())
      .then((row) => dispatch({ type: 'ADD_ROW', row }))
      .catch((error: unknown) => {
        console.error('Failed to add row:', error);
      });
  }, []);

  const updateRow = useCallback((id: string, patch: Partial<LearningRow>) => {
    // Stamp statusUpdatedAt client-side so the optimistic update and the
    // persisted value are identical — the progress chart reads this field.
    const fullPatch = patch.status
      ? { ...patch, statusUpdatedAt: new Date().toISOString() }
      : patch;
    dispatch({ type: 'UPDATE_ROW', id, patch: fullPatch });
    updateArticle(id, fullPatch).catch((error: unknown) => {
      console.error('Failed to save row update:', error);
    });
  }, []);

  const deleteRow = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ROW', id });
    deleteArticle(id).catch((error: unknown) => {
      console.error('Failed to delete row:', error);
    });
  }, []);

  const setFilters = useCallback((patch: Partial<RowFilters>) => {
    dispatch({ type: 'SET_FILTERS', patch });
  }, []);

  const setSort = useCallback((sort: SortState) => {
    dispatch({ type: 'SET_SORT', sort });
  }, []);

  const fetchSuggestionsForFocus = useCallback(async (focus: LearningFocus) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const rows = await fetchSuggestions(focus);
      dispatch({ type: 'FETCH_SUCCESS', rows });
    } catch (error) {
      dispatch({
        type: 'FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Something went wrong.',
      });
    }
  }, []);

  const submitManualEntry = useCallback(
    async (input: { url?: string; rawText?: string; title?: string }) => {
      dispatch({ type: 'PARSE_START' });
      try {
        const row = await parseManualEntry(input);
        dispatch({ type: 'PARSE_SUCCESS', row });
        dispatch({
          type: 'TOAST_ADD',
          toast: {
            id: crypto.randomUUID(),
            type: 'success',
            message: `Added "${row.title}" to your table.`,
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Something went wrong.';
        dispatch({ type: 'PARSE_ERROR', message });
        dispatch({
          type: 'TOAST_ADD',
          toast: {
            id: crypto.randomUUID(),
            type: 'error',
            message: `Couldn't parse that: ${message}`,
          },
        });
      }
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    dispatch({ type: 'TOAST_DISMISS', id });
  }, []);

  return {
    rows: state.rows,
    visibleRows,
    filters: state.filters,
    sort: state.sort,
    studyPlan,
    metrics,
    dailyProgress,
    sourceOptions,
    initStatus: state.initStatus,
    initError: state.initError,
    fetchStatus: state.fetchStatus,
    fetchError: state.fetchError,
    parseStatus: state.parseStatus,
    parseError: state.parseError,
    toasts: state.toasts,
    addBlankRow,
    updateRow,
    deleteRow,
    setFilters,
    setSort,
    fetchSuggestionsForFocus,
    submitManualEntry,
    dismissToast,
    retryInit: loadArticles,
  };
}
