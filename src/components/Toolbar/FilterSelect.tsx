interface FilterSelectProps<T extends string> {
  label: string;
  value: T | 'All';
  options: readonly T[];
  optionLabels?: Record<string, string>;
  onChange: (value: T | 'All') => void;
}

export function FilterSelect<T extends string>({
  label,
  value,
  options,
  optionLabels,
  onChange,
}: FilterSelectProps<T>) {
  return (
    <label className="flex items-center gap-1.5 text-sm text-slate-600">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T | 'All')}
        className="rounded border border-slate-200 px-1.5 py-1 text-sm"
      >
        <option value="All">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabels?.[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}
