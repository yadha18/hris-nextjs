"use client";

import { useDispatch, useSelector } from "react-redux";
import Button from "@/components/ui/Button";
import DataTable, { Td } from "@/components/ui/DataTable";
import Pill from "@/components/ui/Pill";
import { LAPTOP_STATUS_VARIANTS } from "@/lib/config";
import { suggestLaptopStatus } from "@/lib/laptopService";
import { openModal } from "@/store/slices/uiSlice";
import ProofThumbnail from "./ProofThumbnail";

const TABLE_HEADERS = [
  "Aksi",
  "No",
  "NIP",
  "Nama Perangkat",
  "PA",
  "Nama Pengguna",
  "Jabatan",
  "Grade",
  "Serial Number",
  "Regional (SBU)",
  "Status Laptop",
  "Bukti BA",
];
const dashIfEmpty = (value) => value || "—";

export default function LaptopTable({ rows, firstRowNumber }) {
  const dispatch = useDispatch();
  const employees = useSelector((state) => state.hris.karyawan);
  const showModal = (name, payload) => () =>
    dispatch(openModal({ name, payload }));

  return (
    <DataTable headers={TABLE_HEADERS} minWidthClass="min-w-[1200px]">
      {rows.map((row, index) => {
        const suggestedStatus = suggestLaptopStatus(
          employees,
          row.NIP,
          Boolean(row.BuktiBA),
        );
        const hasStatusMismatch =
          !row.isVirtual && row.Status && row.Status !== suggestedStatus;

        return (
          <tr
            key={row.id}
            className={`hover:bg-white/[0.02] ${row.isVirtual ? "opacity-75" : ""}`}
          >
            <Td>
              {row.isVirtual ? (
                <Button
                  size="sm"
                  onClick={showModal("editLaptop", {
                    entryId: null,
                    prefillNip: row.NIP,
                  })}
                >
                  ➕ Tambah
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={showModal("editLaptop", { entryId: row.id })}
                  >
                    ✏️
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={showModal("confirmDeleteLaptop", row.id)}
                  >
                    🗑
                  </Button>
                </div>
              )}
            </Td>
            <Td className="text-center font-mono text-xs">
              {firstRowNumber + index}
            </Td>
            <Td className="font-mono text-xs">{dashIfEmpty(row.NIP)}</Td>
            <Td>{dashIfEmpty(row.NamaPerangkat)}</Td>
            <Td>{dashIfEmpty(row.PA)}</Td>
            <Td className="font-medium">
              {!row.isVirtual && row.NIP ? (
                <button
                  type="button"
                  title="Lihat detail peminjaman"
                  onClick={showModal("laptopHistory", row.NIP)}
                  className="cursor-pointer text-accent-light"
                >
                  {row.NamaPengguna || "—"}
                </button>
              ) : (
                dashIfEmpty(row.NamaPengguna)
              )}
            </Td>
            <Td className="text-xs">{dashIfEmpty(row.Jabatan)}</Td>
            <Td>
              {row.Grade ? <Pill variant="purple">{row.Grade}</Pill> : "—"}
            </Td>
            <Td className="font-mono text-xs">
              {dashIfEmpty(row.SerialNumber)}
            </Td>
            <Td>{dashIfEmpty(row.SBU)}</Td>
            <Td>
              <Pill variant={LAPTOP_STATUS_VARIANTS[row.Status] ?? "gray"}>
                {row.Status || "Belum diisi"}
              </Pill>
              {hasStatusMismatch && (
                <div className="mt-0.5 text-[10px] text-warning">
                  ⚠️ Saran: {suggestedStatus}
                </div>
              )}
            </Td>
            <Td className="text-center">
              <ProofThumbnail laptop={row} />
            </Td>
          </tr>
        );
      })}
    </DataTable>
  );
}
