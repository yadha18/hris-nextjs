export default function EmptyState({ icon, title, description }) {
  return (
    <div className="px-5 py-[60px] text-center text-fg-subtle">
      <div className="mb-3 text-5xl">{icon}</div>
      <h3 className="mb-1.5 text-[15px] text-fg-muted">{title}</h3>
      {description && <p className="text-[13px]">{description}</p>}
    </div>
  );
}