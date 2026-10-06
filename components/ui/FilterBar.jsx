import { CONTROL_CLASS, SelectControl } from './FormField';

export default function FilterBar({ searchValue, searchPlaceholder, onSearchChange, selects }) {
  return (
    <div className="mb-4 flex flex-col gap-2.5 md:flex-row md:flex-wrap md:items-center">
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        className={`${CONTROL_CLASS} md:min-w-[180px] md:flex-1`}
      />
      {selects.map(({ key, placeholder, options, value, onChange }) => (
        <SelectControl
          key={key}
          placeholder={placeholder}
          options={options}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="md:w-auto"
        />
      ))}
    </div>
  );
}