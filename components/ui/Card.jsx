export function Card({ className = '', children }) {
  return <div className={`mb-5 rounded-xl border border-line bg-surface p-3.5 md:p-5 ${className}`}>{children}</div>;
}

export function CardTitle({ children }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.05em] text-fg-muted">
      {children}
    </div>
  );
}