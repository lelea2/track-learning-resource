import type { LearningRow } from '../../types';
import { COLUMNS } from './columns';
import { EditableCell } from './EditableCell';
import { LongTextCell } from './LongTextCell';
import { SelectCell } from './SelectCell';
import { TitleUrlCell } from './TitleUrlCell';

interface TableRowProps {
  row: LearningRow;
  onUpdate: (id: string, patch: Partial<LearningRow>) => void;
  onDelete: (id: string) => void;
}

export function TableRow({ row, onUpdate, onDelete }: TableRowProps) {
  return (
    <tr className="group border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60">
      {COLUMNS.map((column) => {
        const key = column.key;
        const value = row[key];
        const ariaLabel = `${column.label} for ${row.title || 'row'}`;
        const stickyClasses = column.sticky
          ? 'sticky left-0 z-10 bg-white shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)] group-hover:bg-slate-50'
          : '';

        return (
          <td
            key={String(key)}
            className={`p-0 align-top ${column.width ?? ''} ${stickyClasses}`}
          >
            {column.type === 'readonly' && (
              <div className="px-1.5 py-1 text-sm text-slate-500">{String(value)}</div>
            )}
            {column.type === 'text' && (
              <EditableCell
                type="text"
                value={String(value)}
                ariaLabel={ariaLabel}
                onCommit={(next) => onUpdate(row.id, { [key]: next } as Partial<LearningRow>)}
              />
            )}
            {column.type === 'longText' && (
              <LongTextCell
                value={String(value)}
                ariaLabel={ariaLabel}
                onCommit={(next) => onUpdate(row.id, { [key]: next } as Partial<LearningRow>)}
              />
            )}
            {column.type === 'number' && (
              <EditableCell
                type="number"
                value={Number(value)}
                ariaLabel={ariaLabel}
                onCommit={(next) => onUpdate(row.id, { [key]: next } as Partial<LearningRow>)}
              />
            )}
            {column.type === 'select' && column.options && (
              <SelectCell
                columnKey={String(key)}
                value={String(value)}
                options={column.options}
                optionLabels={column.optionLabels}
                ariaLabel={ariaLabel}
                onCommit={(next) => onUpdate(row.id, { [key]: next } as Partial<LearningRow>)}
              />
            )}
            {column.type === 'titleUrl' && (
              <TitleUrlCell
                title={row.title}
                url={row.url}
                noteContent={row.noteContent}
                rowLabel={row.title || 'row'}
                onCommitTitle={(next) => onUpdate(row.id, { title: next })}
                onCommitUrl={(next) => onUpdate(row.id, { url: next })}
                onDelete={() => onDelete(row.id)}
              />
            )}
          </td>
        );
      })}
    </tr>
  );
}
