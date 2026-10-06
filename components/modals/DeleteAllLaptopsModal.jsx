"use client";

import { useDispatch, useSelector } from "react-redux";
import { deleteAllLaptops } from "@/store/laptopActions";
import { closeModal, showToast } from "@/store/slices/uiSlice";
import ConfirmDeleteAllModal from "./ConfirmDeleteAllModal";

export default function DeleteAllLaptopsModal() {
  const dispatch = useDispatch();
  const laptopCount = useSelector((state) => state.hris.laptop.length);

  const handleConfirm = () => {
    const deletedCount = dispatch(deleteAllLaptops());
    dispatch(closeModal());
    dispatch(
      showToast(`🗑 Semua data laptop (${deletedCount}) berhasil dihapus`),
    );
  };

  return (
    <ConfirmDeleteAllModal
      title="🗑 Hapus Semua Data Laptop"
      warningText="Seluruh data monitoring laptop akan dihapus permanen dan tidak dapat dikembalikan."
      summaryRows={[
        {
          label: "Total Data Laptop",
          value: `${laptopCount} data`,
          isDanger: true,
        },
        { label: "Log Perubahan", value: "Akan tetap disimpan" },
      ]}
      onConfirm={handleConfirm}
      onClose={() => dispatch(closeModal())}
    />
  );
}
