"use client";

import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@/components/ui/Button";
import DataTable, { Td } from "@/components/ui/DataTable";
import InfoNote from "@/components/ui/InfoNote";
import Modal, { ModalActions } from "@/components/ui/Modal";
import Pill from "@/components/ui/Pill";
import StatusPill from "@/components/ui/StatusPill";
import { buildJabatanHistory } from "@/lib/employeeService";
import {
  countFullMonthsBetween,
  formatDateId,
  formatDurationMonths,
  formatRupiah,
} from "@/lib/utils";
import { closeModal } from "@/store/slices/uiSlice";
import LaptopHistoryList from "../laptop/LaptopHistoryList";

const HISTORY_HEADERS = ["Jabatan", "Mulai", "Selesai", "Durasi Menjabat"];

function SectionTitle({ children }) {
  return (
    <div className="mb-3 mt-5 flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-[0.05em] text-fg-muted">
      {children}
    </div>
  );
}

export default function EmployeeDetailModal({ employeeId }) {
  const dispatch = useDispatch();
  const employee = useSelector((state) =>
    state.hris.karyawan.find((existing) => existing.id === employeeId),
  );
  const logEntries = useSelector((state) => state.hris.log);
  const history = useMemo(
    () => (employee ? buildJabatanHistory(employee, logEntries).reverse() : []),
    [employee, logEntries],
  );

  if (!employee) return null;

  const infoItems = [
    ["NIK", employee.NIK],
    ["Grade", employee.Grade && <Pill variant="purple">{employee.Grade}</Pill>],
    [
      "Jabatan Saat Ini",
      <Pill key="jabatan" variant="blue">
        {employee.Jabatan}
      </Pill>,
    ],
    ["SBU", employee.SBU],
    ["Gaji Pokok", formatRupiah(employee.GajiPokok)],
    ["Harga Satuan", formatRupiah(employee.HargaSatuan)],
    ["PJTK", employee.PJTK],
    ["No. SP2K", employee.NoSP2K],
    ["Nama TL", employee.NamaTL],
    [
      "Sub Bidang",
      employee.SubBidang && <Pill variant="gray">{employee.SubBidang}</Pill>,
    ],
    ["BKO Jabatan", employee.BKOJabatan],
    ["BKO SBU", employee.BKOSBU],
    ["Email", employee.Email],
    ["Email Korporat", employee.EmailKorporat],
    ["Nama Akun ICRM", employee.NamaAkunICRM],
    ["No. Telepon", employee.NoTelp],
    ["Ukuran Baju", employee.UkuranBaju],
    ["Tanggal Masuk", formatDateId(employee.TglMasuk)],
    ["Tanggal Keluar", formatDateId(employee.TglKeluar)],
    ["NIP Baru", employee.NIPBaru],
    ["Terakhir Update", formatDateId(employee.TglUpdate)],
  ];

  return (
    <Modal
      title="👤 Detail Karyawan"
      onClose={() => dispatch(closeModal())}
      widthClass="max-w-[720px]"
    >
      <div className="rounded-xl border border-line-strong bg-surface2 p-3.5 md:p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2.5">
          <div>
            <div className="text-lg font-bold">{employee.Nama}</div>
            <div className="mt-0.5 font-mono text-xs text-fg-muted">
              NIP: {employee.NIP}
            </div>
          </div>
          <StatusPill status={employee.Status} />
        </div>
        <div className="grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-2">
          {infoItems.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <div className="mb-0.5 text-[11px] uppercase tracking-[0.04em] text-fg-muted">
                {label}
              </div>
              <div className="break-words text-[13.5px] font-medium">
                {value || "—"}
              </div>
            </div>
          ))}
        </div>
        {employee.StatusCatatan && (
          <InfoNote className="mb-0 mt-3.5">
            📝 Catatan Status: {employee.StatusCatatan}
          </InfoNote>
        )}
      </div>

      <SectionTitle>📜 Histori Perpindahan Jabatan</SectionTitle>
      <DataTable headers={HISTORY_HEADERS}>
        {history.map(({ jabatan, startDate, endDate, isCurrent }) => (
          <tr
            key={`${jabatan}-${startDate}`}
            className={isCurrent ? "border-l-[3px] border-l-accent" : ""}
          >
            <Td>
              <Pill variant="blue">{jabatan || "—"}</Pill>
              {isCurrent && (
                <Pill variant="green" className="ml-1">
                  Saat Ini
                </Pill>
              )}
            </Td>
            <Td className="text-xs text-fg-muted">{formatDateId(startDate)}</Td>
            <Td className="text-xs text-fg-muted">
              {isCurrent ? (
                <span className="font-semibold text-accent-light">
                  Sekarang
                </span>
              ) : (
                formatDateId(endDate)
              )}
            </Td>
            <Td className="font-semibold">
              {formatDurationMonths(countFullMonthsBetween(startDate, endDate))}
            </Td>
          </tr>
        ))}
      </DataTable>

      <SectionTitle>💻 Data Monitoring Laptop</SectionTitle>
      <LaptopHistoryList nip={employee.NIP} />

      <ModalActions>
        <Button variant="secondary" onClick={() => dispatch(closeModal())}>
          Tutup
        </Button>
      </ModalActions>
    </Modal>
  );
}
