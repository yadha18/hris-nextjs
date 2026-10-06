"use client";

import { useDispatch, useSelector } from "react-redux";
import Button from "@/components/ui/Button";
import Modal, { ModalActions } from "@/components/ui/Modal";
import LaptopHistoryList from "@/components/laptop/LaptopHistoryList";
import { findLaptopsByNip } from "@/lib/laptopService";
import { findEmployeeByNip } from "@/lib/utils";
import { closeModal } from "@/store/slices/uiSlice";

export default function LaptopHistoryModal({ nip }) {
  const dispatch = useDispatch();
  const employee = useSelector((state) =>
    findEmployeeByNip(state.hris.karyawan, nip),
  );
  const firstLaptop = useSelector(
    (state) => findLaptopsByNip(state.hris.laptop, nip)[0],
  );

  const displayName = employee?.Nama ?? firstLaptop?.NamaPengguna ?? nip;
  const sbuName = employee?.SBU ?? firstLaptop?.SBU ?? "—";
  const resignNote =
    employee?.Status === "Resign" ? " · ⚠️ Status Karyawan: RESIGN" : "";

  return (
    <Modal
      title={`💻 Riwayat Peminjaman Laptop — ${displayName}`}
      onClose={() => dispatch(closeModal())}
      widthClass="max-w-[560px]"
    >
      <div className="mb-3.5 text-xs text-fg-muted">
        NIP: {nip} · SBU: {sbuName}
        {resignNote}
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        <LaptopHistoryList nip={nip} />
      </div>
      <ModalActions>
        <Button variant="secondary" onClick={() => dispatch(closeModal())}>
          Tutup
        </Button>
      </ModalActions>
    </Modal>
  );
}
