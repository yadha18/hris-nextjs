import { LEMBUR_MONTH_OPTIONS } from "../config";
import { createLemburEntry, createLogEntry } from "../models";
import {
  findEmployeeByNip,
  formatRupiah,
  normalizeBulan,
  parseNominal,
} from "../utils";

const COLUMNS = [
  { header: "NIP", field: "NIP", isMono: true },
  {
    header: "Nominal",
    field: "Nominal",
    formatPreview: (value) => formatRupiah(parseNominal(value)),
  },
  { header: "Bulan", field: "Bulan" },
  { header: "Tagihan", field: "Tagihan" },
];

const ROW_STATUSES = {
  new: { label: "✔ Valid", variant: "green" },
  invalid_nip: { label: "✕ NIP Kosong", variant: "red", isSkipped: true },
  invalid_nominal: {
    label: "✕ Nominal Tidak Valid",
    variant: "red",
    isSkipped: true,
  },
  invalid_month: {
    label: "✕ Bulan Tidak Dikenali",
    variant: "red",
    isSkipped: true,
  },
};

const SUMMARY_CARDS = [
  {
    label: "✔ Data Valid (akan ditambahkan)",
    tone: "success",
    statuses: ["new"],
  },
  {
    label: "✕ Tidak Valid (dilewati)",
    tone: "danger",
    statuses: ["invalid_nip", "invalid_nominal", "invalid_month"],
  },
];

function classifyRows(rawRows) {
  return rawRows.map((row) => {
    let uploadStatus = "new";
    if (!row.NIP.trim()) uploadStatus = "invalid_nip";
    else if (!parseNominal(row.Nominal)) uploadStatus = "invalid_nominal";
    else if (!LEMBUR_MONTH_OPTIONS.includes(normalizeBulan(row.Bulan)))
      uploadStatus = "invalid_month";
    return { ...row, uploadStatus };
  });
}

// File cukup berisi NIP; Nama, SBU, dan Jabatan diambil dari Data Karyawan
function planUpload(rawRows, { karyawan, lembur }) {
  const newEntries = classifyRows(rawRows)
    .filter((row) => row.uploadStatus === "new")
    .map((row) => {
      const employee = findEmployeeByNip(karyawan, row.NIP);
      return createLemburEntry({
        NIP: row.NIP,
        Nominal: row.Nominal,
        Bulan: row.Bulan,
        Tagihan: row.Tagihan,
        Nama: employee?.Nama,
        SBU: employee?.SBU,
        Jabatan: employee?.Jabatan,
      });
    });

  const skippedCount = rawRows.length - newEntries.length;
  const logEntries = rawRows.length
    ? [
        createLogEntry({
          nip: "SYSTEM",
          name: "SYSTEM",
          type: "lembur upload",
          oldValue: `${rawRows.length} baris diproses`,
          newValue: `${newEntries.length} baru ditambahkan, ${skippedCount} dilewati (NIP/Nominal/Bulan tidak valid)`,
        }),
      ]
    : [];

  return {
    changes: { lembur: [...lembur, ...newEntries], logEntries },
    toast: {
      message:
        skippedCount > 0
          ? `✅ ${newEntries.length} data lembur/SPPD ditambahkan. ⚠ ${skippedCount} baris dilewati (tidak valid).`
          : `✅ ${newEntries.length} data lembur/SPPD berhasil disimpan.`,
      durationMs: 5000,
    },
    destination: newEntries.length
      ? { lemburMonth: newEntries[0].Bulan }
      : null,
  };
}

export const lemburUpload = {
  label: "Data Lembur & SPPD Karyawan",
  icon: "🧾",
  columns: COLUMNS,
  rowIdentityFields: ["NIP", "Nominal"],
  rowStatuses: ROW_STATUSES,
  summaryCards: SUMMARY_CARDS,
  classifyRows,
  planUpload,
};
