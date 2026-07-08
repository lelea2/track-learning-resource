import {
  ARTICLE_SOURCE_OPTIONS,
  DIFFICULTY_OPTIONS,
  LEARNING_FOCUS_LABELS,
  LEARNING_FOCUS_OPTIONS,
  PRIORITY_OPTIONS,
  STUDY_STATUS_OPTIONS,
} from '../../types';
import type { RowFilters } from '../../utils/filtering';
import type { SortField, SortState } from '../../utils/sorting';
import { FilterSelect } from './FilterSelect';

interface ToolbarProps {
  filters: RowFilters;
  sort: SortState;
  visibleCount: number;
  totalCount: number;
  onFiltersChange: (patch: Partial<RowFilters>) => void;
  onSortChange: (sort: SortState) => void;
}

const SORT_FIELD_OPTIONS: { value: SortField | ''; label: string }[] = [
  { value: '', label: 'None' },
  { value: 'priority', label: 'Priority' },
  { value: 'topic', label: 'Topic' },
  { value: 'estimatedTime', label: 'Estimated time' },
];

export function Toolbar({
  filters,
  sort,
  visibleCount,
  totalCount,
  onFiltersChange,
  onSortChange,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
      <label className="flex items-center gap-1.5 text-sm text-slate-600">
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4 text-slate-400"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 3.44 9.79l3.135 3.136a.75.75 0 1 0 1.06-1.06l-3.135-3.136A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="search"
          value={filters.search}
          onChange={(event) => onFiltersChange({ search: event.target.value })}
          placeholder="Search titles…"
          aria-label="Search titles"
          className="w-40 rounded border border-slate-200 px-1.5 py-1 text-sm outline-none focus:border-indigo-400"
        />
      </label>

      <FilterSelect
        label="Status"
        value={filters.status}
        options={STUDY_STATUS_OPTIONS}
        onChange={(status) => onFiltersChange({ status })}
      />

      <FilterSelect
        label="Topic"
        value={filters.topic}
        options={LEARNING_FOCUS_OPTIONS}
        optionLabels={LEARNING_FOCUS_LABELS}
        onChange={(topic) => onFiltersChange({ topic })}
      />

      <FilterSelect
        label="Difficulty"
        value={filters.difficulty}
        options={DIFFICULTY_OPTIONS}
        onChange={(difficulty) => onFiltersChange({ difficulty })}
      />

      <FilterSelect
        label="Priority"
        value={filters.priority}
        options={PRIORITY_OPTIONS}
        onChange={(priority) => onFiltersChange({ priority })}
      />

      <FilterSelect
        label="Source"
        value={filters.source}
        options={ARTICLE_SOURCE_OPTIONS}
        onChange={(source) => onFiltersChange({ source })}
      />

      <label className="flex items-center gap-1.5 text-sm text-slate-600">
        Sort by
        <select
          value={sort.field ?? ''}
          onChange={(event) =>
            onSortChange({ ...sort, field: (event.target.value || null) as SortField | null })
          }
          className="rounded border border-slate-200 px-1.5 py-1 text-sm"
        >
          {SORT_FIELD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {sort.field && (
        <button
          type="button"
          onClick={() =>
            onSortChange({ ...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc' })
          }
          className="rounded border border-slate-200 px-2 py-1 text-sm text-slate-600 hover:bg-slate-50"
        >
          {sort.direction === 'asc' ? '↑ Ascending' : '↓ Descending'}
        </button>
      )}

      <span className="ml-auto text-sm text-slate-400">
        {visibleCount} of {totalCount} rows
      </span>
    </div>
  );
}
