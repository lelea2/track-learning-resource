import type { LearningRow } from '../../types';
import { COLUMNS } from './columns';
import { TableRow } from './TableRow';

interface TableProps {
  rows: LearningRow[];
  totalRowCount: number;
  onUpdate: (id: string, patch: Partial<LearningRow>) => void;
  onDelete: (id: string) => void;
  onAddRow: () => void;
}

export function Table({ rows, totalRowCount, onUpdate, onDelete, onAddRow }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            {COLUMNS.map((column) => (
              <th
                key={String(column.key)}
                className={`px-1.5 py-2 ${column.width ?? ''} ${
                  column.sticky ? 'sticky left-0 z-20 bg-slate-50 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]' : ''
                }`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <TableRow key={row.id} row={row} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </tbody>
      </table>

      {rows.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-slate-400">
          {totalRowCount === 0
            ? 'No articles yet — fetch suggestions or paste a link to get started.'
            : 'No rows match the current filters.'}
        </div>
      )}

      <div className="border-t border-slate-200 px-3 py-2">
        <button
          type="button"
          onClick={onAddRow}
          className="rounded px-2 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
        >
          + Add row
        </button>
      </div>
    </div>
  );
}
