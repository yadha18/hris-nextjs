const TONE_CLASSES = {
  info: 'border-accent/20 bg-accent/10 text-accent-light',
  danger: 'border-danger/25 bg-danger/10 text-danger',
  warning: 'border-warning/25 bg-warning/10 text-warning',
  success: 'border-success/20 bg-success/10 text-success',
};

export default function InfoNote({ tone = 'info', className = 'mb-4', children }) {
  return <div className={`rounded-lg border px-3.5 py-2.5 text-xs ${TONE_CLASSES[tone]} ${className}`}>{children}</div>;
}