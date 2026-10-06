'use client';

import { useDispatch, useSelector } from 'react-redux';
import ConfirmActionModal from '@/components/ui/ConfirmActionModal';
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

  return (
    <ConfirmActionModal
      title="🗑 Konfirmasi Hapus Karyawan"
      warningText={<><strong>Tindakan ini tidak dapat dibatalkan.</strong> Data karyawan akan dihapus permanen dari sistem.</>}
      detailRows={[['Nama', employee.Nama], ['NIP', employee.NIP], ['Jabatan', employee.Jabatan], ['SBU', employee.SBU]]}
      confirmLabel="🗑 Ya, Hapus Sekarang"
      onConfirm={handleConfirm}
      onClose={() => dispatch(closeModal())}
    />
  );
}