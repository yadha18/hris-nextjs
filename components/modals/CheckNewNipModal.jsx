'use client';

import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@/components/ui/Button';
import InfoNote from '@/components/ui/InfoNote';
import Modal, { ModalActions } from '@/components/ui/Modal';
import { findNewNipCandidates } from '@/lib/employeeService';
import { applyNewNips } from '@/store/hrisActions';
import { closeModal, showToast } from '@/store/slices/uiSlice';

export default function CheckNewNipModal() {
  const dispatch = useDispatch();
  const employees = useSelector((state) => state.hris.karyawan);
  const { applicable, conflicts } = useMemo(() => findNewNipCandidates(employees), [employees]);

  const handleConfirm = () => {
    const updatedCount = dispatch(applyNewNips());
    dispatch(closeModal());
    dispatch(showToast(`✅ ${updatedCount} NIP berhasil diperbarui.`, 6000));
  };

  return (
    <Modal title="🔁 Konfirmasi Perbarui NIP" onClose={() => dispatch(closeModal())} widthClass="max-w-[560px]">
      <InfoNote>
        ℹ️ NIP untuk <strong>{applicable.length}</strong> karyawan berikut akan diganti sesuai kolom &quot;NIP Baru&quot; masing-masing. Kolom NIP Baru akan dikosongkan setelah diterapkan, dan data Lembur/SPPD serta Monitoring Laptop yang memakai NIP lama ikut disesuaikan otomatis.
      </InfoNote>

      <div className="mb-3 max-h-80 overflow-y-auto">
        {applicable.map((employee) => (
          <div key={employee.id} className="flex justify-between gap-2.5 border-b border-line py-2 text-[13px]">
            <span className="font-medium">{employee.Nama}</span>
            <span className="font-mono text-fg-muted">
              {employee.NIP} → <span className="font-semibold text-accent-light">{employee.NIPBaru.trim()}</span>
            </span>
          </div>
        ))}
      </div>

      {conflicts.length > 0 && (
        <InfoNote tone="warning" className="mb-0">
          ⚠️ {conflicts.length} data dilewati karena NIP Baru-nya sudah dipakai karyawan lain: {conflicts.map((employee) => employee.Nama).join(', ')}.
        </InfoNote>
      )}

      <ModalActions>
        <Button variant="secondary" onClick={() => dispatch(closeModal())}>Batal</Button>
        <Button onClick={handleConfirm}>✅ Ya, Perbarui NIP</Button>
      </ModalActions>
    </Modal>
  );
}