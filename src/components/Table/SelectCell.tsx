import { getBadgeClass } from './badgeStyles';

interface SelectCellProps {
  columnKey: string;
  value: string;
  options: readonly string[];
  optionLabels?: Record<string, string>;
  onCommit: (value: string) => void;
  ariaLabel: string;
}

export function SelectCell({
  columnKey,
  value,
  options,
  optionLabels,
  onCommit,
  ariaLabel,
}: SelectCellProps) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onCommit(event.target.value)}
      className={`w-full cursor-pointer rounded-full border-0 px-2 py-1 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${getBadgeClass(columnKey, value)}`}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {optionLabels?.[option] ?? option}
        </option>
      ))}
    </select>
  );
}
