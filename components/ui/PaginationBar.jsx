const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function buildVisiblePages(currentPage, totalPages) {
  const windowStart = Math.max(1, currentPage - 2);
  const windowEnd = Math.min(totalPages, currentPage + 2);
  const pages = [];

  if (windowStart > 1) {
    pages.push(1);
    if (windowStart > 2) pages.push('gap-before');
  }
  for (let pageNumber = windowStart; pageNumber <= windowEnd; pageNumber += 1) pages.push(pageNumber);
  if (windowEnd < totalPages) {
    if (windowEnd < totalPages - 1) pages.push('gap-after');
    pages.push(totalPages);
  }
  return pages;
}

function PageButton({ isActive = false, ...buttonProps }) {
  const stateClass = isActive
    ? 'border-accent bg-accent text-white'
    : 'border-line-strong bg-surface2 text-fg enabled:hover:border-accent enabled:hover:text-accent-light';
  return (
    <button
      type="button"
      className={`cursor-pointer rounded-md border px-3 py-1.5 text-[13px] font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${stateClass}`}
      {...buttonProps}
    />
  );
}

export default function PaginationBar({
  page, pageSize, totalItems, itemLabel,
  onPageChange, onPageSizeChange, pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <div className="mt-4 flex flex-col items-stretch gap-3 text-center text-[13px] text-fg-muted md:flex-row md:items-center md:justify-between md:text-left">
      <div>
        Menampilkan
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="mx-1.5 cursor-pointer rounded-md border border-line-strong bg-surface2 px-2 py-1 text-fg outline-none"
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {itemLabel} per halaman. Total: <span className="font-semibold text-fg">{totalItems}</span> {itemLabel}.
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <PageButton disabled={page === 1} onClick={() => onPageChange(page - 1)}>❮</PageButton>
        {buildVisiblePages(page, totalPages).map((item) =>
          typeof item === 'number' ? (
            <PageButton key={item} isActive={item === page} onClick={() => onPageChange(item)}>{item}</PageButton>
          ) : (
            <span key={item}>...</span>
          )
        )}
        <PageButton disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>❯</PageButton>
      </div>
    </div>
  );
}