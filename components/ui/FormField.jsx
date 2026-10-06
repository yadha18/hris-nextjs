export const CONTROL_CLASS =
  'w-full rounded-lg border border-line-strong bg-surface2 px-3 py-[9px] text-[13px] text-fg outline-none transition focus:border-accent read-only:cursor-not-allowed disabled:cursor-not-allowed';

export function FormRow({ children }) {
  return <div className="flex flex-col md:flex-row md:gap-3.5">{children}</div>;
}

export function FormField({ label, labelNote, required = false, hint, className = 'mb-4', children }) {
  return (
    <div className={`w-full ${className}`}>
      <label className="mb-1.5 block text-xs font-semibold tracking-[0.04em] text-fg-muted">
        {label}
        {required && <span className="text-danger"> *</span>}
        {labelNote && <span className="font-normal"> {labelNote}</span>}
      </label>
      {children}
      {hint && <div className="mt-1 text-[11px] text-fg-muted">{hint}</div>}
    </div>
  );
}

export function TextControl({ className = '', ...inputProps }) {
  return <input className={`${CONTROL_CLASS} ${className}`} {...inputProps} />;
}

// options: array string, atau array { value, label }
export function SelectControl({ placeholder, options, className = '', ...selectProps }) {
  return (
    <select className={`${CONTROL_CLASS} cursor-pointer ${className}`} {...selectProps}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((option) => {
        const { value, label } = typeof option === 'string' ? { value: option, label: option } : option;
        return <option key={value} value={value}>{label}</option>;
      })}
    </select>
  );
}