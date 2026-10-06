"use client";

import { useDispatch, useSelector } from "react-redux";
import { selectSelectedMonthLembur } from "@/lib/selectors";
import { clearLemburMonth } from "@/store/lemburActions";
import { closeModal, showToast } from "@/store/slices/uiSlice";
import ConfirmDeleteAllModal from "./ConfirmDeleteAllModal";

export default function DeleteAllLemburModal() {
  const dispatch = useDispatch();
  const selectedMonth = useSelector((state) => state.ui.selectedBulan);
  const entryCount = useSelector(selectSelectedMonthLembur).length;

  const handleConfirm = () => {
    const deletedCount = dispatch(clearLemburMonth(selectedMonth));
    dispatch(closeModal());
    dispatch(
      showToast(
        `🗑 Semua data lembur/SPPD bulan ${selectedMonth} (${deletedCount}) berhasil dihapus`,
      ),
    );
  };

  return (
    <ConfirmDeleteAllModal
      title="🗑 Hapus Semua Data Lembur & SPPD (Bulan Ini)"
      warningText="Seluruh data lembur & SPPD pada bulan yang sedang dibuka akan dihapus permanen dan tidak dapat dikembalikan. Bulan lain tidak terpengaruh."
      summaryRows={[
        {
          label: "Total Data Lembur/SPPD",
          value: `${entryCount} data (${selectedMonth})`,
          isDanger: true,
        },
        { label: "Log Perubahan", value: "Akan tetap disimpan" },
      ]}
      onConfirm={handleConfirm}
      onClose={() => dispatch(closeModal())}
    />
  );
}
