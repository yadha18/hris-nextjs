const VARIANT_CLASSES = {
  blue: 'bg-accent/15 text-accent-light',
  green: 'bg-success/15 text-success',
  yellow: 'bg-warning/15 text-warning',
  red: 'bg-danger/15 text-danger',
  purple: 'bg-purple/15 text-purple',
  gray: 'bg-fg-muted/15 text-fg-muted',
};

export default function Pill({ variant = 'gray', className = '', children }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${VARIANT_CLASSES[variant]} ${className}`}>
      {children}
    </span>
  );
}