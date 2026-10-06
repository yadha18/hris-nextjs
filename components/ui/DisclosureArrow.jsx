export default function DisclosureArrow({ isOpen, sizeClass = "text-[10px]" }) {
  return (
    <span
      className={`inline-block shrink-0 text-fg-muted transition-transform ${sizeClass} ${isOpen ? "rotate-90" : ""}`}
    >
      ▶
    </span>
  );
}
