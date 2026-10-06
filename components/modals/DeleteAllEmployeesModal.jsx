'use client';

import { useDispatch, useSelector } from 'react-redux';
import { deleteAllEmployees } from '@/store/hrisActions';
import { closeModal, showToast } from '@/store/slices/uiSlice';
import ConfirmDeleteAllModal from './ConfirmDeleteAllModal';

export default function DeleteAllEmployeesModal() {
  const dispatch = useDispatch();
  const totalEmployees = useSelector((state) => state.hris.karyawan.length);

  const handleConfirm = () => {
    const totalDeleted = dispatch(deleteAllEmployees());
    dispatch(closeModal());
    dispatch(showToast(`🗑 Semua data karyawan (${totalDeleted}) berhasil dihapus`));
  };

  return (
    <ConfirmDeleteAllModal
      title="🗑 Hapus Semua Data Karyawan"
      warningText="Seluruh data karyawan akan dihapus permanen dan tidak dapat dikembalikan."
      summaryRows={[
        { label: 'Total Karyawan', value: `${totalEmployees} karyawan`, isDanger: true },
        { label: 'Log Perubahan', value: 'Akan tetap disimpan' },
      ]}
      onConfirm={handleConfirm}
      onClose={() => dispatch(closeModal())}
    />
  );
}