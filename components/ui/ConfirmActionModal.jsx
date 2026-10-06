'use client';

import Button from './Button';
import InfoNote from './InfoNote';
import Modal, { ModalActions } from './Modal';

export default function ConfirmActionModal({ title, warningText, detailRows, confirmLabel, onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose} widthClass="max-w-[460px]">
      <InfoNote tone="danger" className="mb-5">⚠️ {warningText}</InfoNote>
      <div className="mb-5 rounded-xl border border-line-strong bg-surface2 p-3.5">
        <div className="mb-2.5 text-[11px] uppercase tracking-[0.06em] text-fg-subtle">Data yang akan dihapus</div>
        <div className="grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-1.5 text-[13px]">
          {detailRows.map(([label, value]) => (
            <div key={label} className="contents">
              <span className="text-fg-muted">{label}</span>
              <span className="font-medium">{value || '—'}</span>
            </div>
          ))}
        </div>
      </div>
      <ModalActions>
        <Button variant="secondary" onClick={onClose}>Batal</Button>
        <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
      </ModalActions>
    </Modal>
  );
}