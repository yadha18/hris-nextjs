const ALIGN_CLASSES = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export default function DataTable({
  headers,
  minWidthClass = "",
  bordered = true,
  children,
}) {
  return (
    <div
      className={`overflow-x-auto ${bordered ? "rounded-[10px] border border-line" : ""}`}
    >
      <table className={`w-full border-collapse text-[13px] ${minWidthClass}`}>
        <thead className="bg-surface2">
          <tr>
            {headers.map((header) => {
              const { label, align = "left" } =
                typeof header === "string" ? { label: header } : header;
              return (
                <th
                  key={label}
                  className={`whitespace-nowrap border-b border-line px-3.5 py-[11px] text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-muted ${ALIGN_CLASSES[align]}`}
                >
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child_td]:border-b-0">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ className = "", ...cellProps }) {
  return (
    <td
      className={`whitespace-nowrap border-b border-line px-3.5 py-2.5 align-middle ${className}`}
      {...cellProps}
    />
  );
}
