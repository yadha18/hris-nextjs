'use client';

export default function Modal({ title, onClose, widthClass = 'max-w-[520px]', children }) {
  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 p-2.5 md:p-5">
      <div className={`max-h-[90vh] w-full overflow-y-auto rounded-xl border border-line-strong bg-surface p-4 md:rounded-2xl md:p-7 ${widthClass}`}>
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-[17px] font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="cursor-pointer rounded-md p-1 text-xl text-fg-muted hover:bg-surface2 hover:text-fg"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ModalActions({ children }) {
  return <div className="mt-5 flex flex-wrap justify-end gap-2.5">{children}</div>;
}