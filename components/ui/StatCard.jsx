// StatCard.jsx
const VALUE_TONE_CLASSES = {
  default: "",
  accent: "text-accent-light",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  purple: "text-purple",
  muted: "text-fg-muted",
};

export default function StatCard({
  label,
  value,
  tone = "default",
  onClick,
  title,
}) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      title={title}
      className={`w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-left md:px-[18px] md:py-4 ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="mb-1.5 text-[10px] text-fg-muted min-[481px]:text-[11px]">
        {label}
      </div>
      <div
        className={`font-mono text-lg font-bold min-[481px]:text-[21px] md:text-[26px] ${VALUE_TONE_CLASSES[tone]}`}
      >
        {value}
      </div>
    </Wrapper>
  );
}
