'use client';

import { useDispatch, useSelector } from 'react-redux';
import ConfirmActionModal from '@/components/ui/ConfirmActionModal';
import { formatRupiah } from '@/lib/utils';
import { deleteLemburEntry } from '@/store/lemburActions';
import { closeModal, showToast } from '@/store/slices/uiSlice';

export default function ConfirmDeleteLemburModal({ entryId }) {
  const dispatch = useDispatch();
  const entry = useSelector((state) => state.hris.lembur.find((existing) => existing.id === entryId));
  if (!entry) return null;

  const handleConfirm = () => {
    dispatch(deleteLemburEntry(entryId));
    dispatch(closeModal());
    dispatch(showToast('🗑 Data dihapus'));
  };

  return (
    <ConfirmActionModal
      title="🗑 Konfirmasi Hapus Data Lembur/SPPD"
      warningText={<><strong>Tindakan ini tidak dapat dibatalkan.</strong> Baris data akan dihapus permanen.</>}
      detailRows={[
        ['NIP', entry.NIP], ['Nama', entry.Nama], ['Bulan', entry.Bulan],
        ['Tagihan', entry.Tagihan], ['Nominal', formatRupiah(entry.Nominal)],
      ]}
      confirmLabel="🗑 Ya, Hapus Sekarang"
      onConfirm={handleConfirm}
      onClose={() => dispatch(closeModal())}
    />
  );
}