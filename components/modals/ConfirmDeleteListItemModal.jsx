"use client";

import { useDispatch } from "react-redux";
import ConfirmActionModal from "@/components/ui/ConfirmActionModal";
import { NAMED_LISTS } from "@/lib/config";
import { removeNamedListItem } from "@/store/settingsActions";
import { closeModal, showToast } from "@/store/slices/uiSlice";

export default function ConfirmDeleteListItemModal({ listKey, name }) {
  const dispatch = useDispatch();
  const { itemLabel } = NAMED_LISTS[listKey];

  const handleConfirm = () => {
    dispatch(removeNamedListItem({ listKey, name }));
    dispatch(closeModal());
    dispatch(showToast(`🗑 ${itemLabel} dihapus`));
  };

  return (
    <ConfirmActionModal
      title={`🗑 Konfirmasi Hapus ${itemLabel}`}
      warningText={
        <>
          Data karyawan yang sudah memakai {itemLabel.toLowerCase()} ini{" "}
          <strong>tidak ikut berubah</strong>; hanya pilihan di dropdown yang
          berkurang.
        </>
      }
      detailRows={[[itemLabel, name]]}
      confirmLabel="🗑 Ya, Hapus"
      onConfirm={handleConfirm}
      onClose={() => dispatch(closeModal())}
    />
  );
}
