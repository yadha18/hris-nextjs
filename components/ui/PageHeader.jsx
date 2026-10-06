export default function PageHeader({ title, description, actions = null }) {
  return (
    <div className="mb-6 flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-[19px] font-bold md:text-[22px]">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}