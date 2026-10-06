"use client";

import { useDispatch, useSelector } from "react-redux";
import ConfirmActionModal from "@/components/ui/ConfirmActionModal";
import { deleteLaptopEntry } from "@/store/laptopActions";
import { closeModal, showToast } from "@/store/slices/uiSlice";

export default function ConfirmDeleteLaptopModal({ entryId }) {
  const dispatch = useDispatch();
  const laptop = useSelector((state) =>
    state.hris.laptop.find((entry) => entry.id === entryId),
  );
  if (!laptop) return null;

  const handleConfirm = () => {
    dispatch(deleteLaptopEntry(entryId));
    dispatch(closeModal());
    dispatch(showToast("🗑 Data laptop dihapus"));
  };

  return (
    <ConfirmActionModal
      title="🗑 Konfirmasi Hapus Data Laptop"
      warningText={
        <>
          <strong>Tindakan ini tidak dapat dibatalkan.</strong> Data laptop akan
          dihapus permanen.
        </>
      }
      detailRows={[
        ["Pengguna", laptop.NamaPengguna || laptop.NIP],
        ["Perangkat", laptop.NamaPerangkat],
        ["Serial Number", laptop.SerialNumber],
        ["Status", laptop.Status || "Belum diisi"],
      ]}
      confirmLabel="🗑 Ya, Hapus Sekarang"
      onConfirm={handleConfirm}
      onClose={() => dispatch(closeModal())}
    />
  );
}
