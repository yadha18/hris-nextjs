'use client';

import { useDispatch, useSelector } from 'react-redux';
import Button from '@/components/ui/Button';
import InfoNote from '@/components/ui/InfoNote';
import Modal, { ModalActions } from '@/components/ui/Modal';
import { deleteEmployee } from '@/store/hrisActions';
import { closeModal, showToast } from '@/store/slices/uiSlice';

export default function ConfirmDeleteEmployeeModal({ employeeId }) {
  const dispatch = useDispatch();
  const employee = useSelector((state) => state.hris.karyawan.find((existing) => existing.id === employeeId));
  if (!employee) return null;

  const handleConfirm = () => {
    dispatch(deleteEmployee(employeeId));
    dispatch(closeModal());
    dispatch(showToast(`🗑 Karyawan "${employee.Nama}" berhasil dihapus`));
  };

  const detailRows = [['Nama', employee.Nama], ['NIP', employee.NIP], ['Jabatan', employee.Jabatan], ['SBU', employee.SBU]];

  return (
    <Modal title="🗑 Konfirmasi Hapus Karyawan" onClose={() => dispatch(closeModal())} widthClass="max-w-[460px]">
      <InfoNote tone="danger" className="mb-5">
        ⚠️ <strong>Tindakan ini tidak dapat dibatalkan.</strong> Data karyawan akan dihapus permanen dari sistem.
      </InfoNote>
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
        <Button variant="secondary" onClick={() => dispatch(closeModal())}>Batal</Button>
        <Button variant="danger" onClick={handleConfirm}>🗑 Ya, Hapus Sekarang</Button>
      </ModalActions>
    </Modal>
  );
}