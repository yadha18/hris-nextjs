'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { FormField, TextControl } from '@/components/ui/FormField';
import InfoNote from '@/components/ui/InfoNote';
import Modal, { ModalActions } from '@/components/ui/Modal';

const CONFIRMATION_PHRASE = 'HAPUS SEMUA';

export default function ConfirmDeleteAllModal({ title, warningText, summaryRows, onConfirm, onClose }) {
  const [typedPhrase, setTypedPhrase] = useState('');
  const isConfirmed = typedPhrase === CONFIRMATION_PHRASE;

  return (
    <Modal title={title} onClose={onClose} widthClass="max-w-[480px]">
      <InfoNote tone="danger" className="mb-5">⚠️ <strong>Peringatan keras!</strong> {warningText}</InfoNote>

      <div className="mb-5 rounded-xl border border-line-strong bg-surface2 p-3.5">
        <div className="mb-2.5 text-[11px] uppercase tracking-[0.06em] text-fg-subtle">Ringkasan data yang akan dihapus</div>
        <div className="grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-1.5 text-[13px]">
          {summaryRows.map(({ label, value, isDanger = false }) => (
            <div key={label} className="contents">
              <span className="text-fg-muted">{label}</span>
              <span className={isDanger ? 'font-bold text-danger' : 'text-xs text-fg-muted'}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <FormField label={<span className="text-danger">Ketik <strong>{CONFIRMATION_PHRASE}</strong> untuk konfirmasi</span>} className="mb-5">
        <TextControl
          placeholder={CONFIRMATION_PHRASE}
          value={typedPhrase}
          onChange={(event) => setTypedPhrase(event.target.value)}
          className="border-danger/40"
        />
      </FormField>

      <ModalActions>
        <Button variant="secondary" onClick={onClose}>Batal</Button>
        <Button variant="danger" disabled={!isConfirmed} onClick={onConfirm}>🗑 Hapus Semua Data</Button>
      </ModalActions>
    </Modal>
  );
}