import { LAPTOP_EXCLUDED_JABATAN } from "../config";
import { createLaptopEntry, createLogEntry } from "../models";
import {
  findEmployeeByNip,
  isLaptopSerialReleased,
  normalizeLaptopStatus,
} from "../utils";

const COLUMNS = [
  { header: "NIP", field: "NIP", isMono: true },
  {
    header: "Nama Perangkat",
    field: "NamaPerangkat",
    aliases: ["Nama Perangkat", "Perangkat"],
  },
  { header: "PA", field: "PA" },
  {
    header: "Serial Number",
    field: "SerialNumber",
    aliases: ["Serial Number", "Serial", "SN"],
  },
  {
    header: "Status",
    field: "Status",
    aliases: ["Status Laptop", "Status"],
    formatPreview: (value) => normalizeLaptopStatus(value) || "(belum diisi)",
  },
  {
    header: "Nama Pengguna",
    field: "NamaPengguna",
    aliases: ["Nama Pengguna", "Pengguna"],
    isHiddenInPreview: true,
  },
  {
    header: "Regional",
    field: "SBU",
    aliases: ["Regional (SBU)", "Regional", "SBU"],
    isHiddenInPreview: true,
  },
];

const ROW_STATUSES = {
  new: { label: "✔ Valid", variant: "green" },
  invalid_identity: {
    label: "✕ NIP & Nama Pengguna Kosong",
    variant: "red",
    isSkipped: true,
  },
  invalid_device: {
    label: "✕ Nama Perangkat Kosong",
    variant: "red",
    isSkipped: true,
  },
  invalid_serial: {
    label: "✕ Serial Number Kosong",
    variant: "red",
    isSkipped: true,
  },
  invalid_excluded_jabatan: {
    label: "✕ Jabatan Tidak Berhak Laptop",
    variant: "red",
    isSkipped: true,
  },
  invalid_duplicate_serial: {
    label: "✕ Serial Number Sudah Dipakai",
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
    statuses: [
      "invalid_identity",
      "invalid_device",
      "invalid_serial",
      "invalid_excluded_jabatan",
      "invalid_duplicate_serial",
    ],
  },
];

const toSerialKey = (serialNumber) =>
  String(serialNumber || "")
    .trim()
    .toLowerCase();

function classifyRows(rawRows, { karyawan, laptop }) {
  // Serial yang pemegang lamanya sudah Resign & laptopnya sudah dikembalikan boleh dipakai ulang
  const occupiedSerials = new Set(
    laptop
      .filter((entry) => !isLaptopSerialReleased(entry, karyawan))
      .map((entry) => toSerialKey(entry.SerialNumber))
      .filter(Boolean),
  );
  const serialsSeenInFile = new Set();

  return rawRows.map((row) => {
    const nip = row.NIP.trim();
    const serialKey = toSerialKey(row.SerialNumber);
    const employee = nip ? findEmployeeByNip(karyawan, nip) : null;

    let uploadStatus = "new";
    if (!nip && !row.NamaPengguna.trim()) uploadStatus = "invalid_identity";
    else if (!row.NamaPerangkat.trim()) uploadStatus = "invalid_device";
    else if (!serialKey) uploadStatus = "invalid_serial";
    else if (employee && LAPTOP_EXCLUDED_JABATAN.includes(employee.Jabatan))
      uploadStatus = "invalid_excluded_jabatan";
    else if (occupiedSerials.has(serialKey) || serialsSeenInFile.has(serialKey))
      uploadStatus = "invalid_duplicate_serial";

    if (uploadStatus === "new") serialsSeenInFile.add(serialKey);
    return { ...row, uploadStatus };
  });
}

// Nama Pengguna & Regional diambil dari Data Karyawan bila NIP ditemukan; jika tidak, pakai isi Excel
function planUpload(rawRows, { karyawan, laptop }) {
  const newEntries = classifyRows(rawRows, { karyawan, laptop })
    .filter((row) => row.uploadStatus === "new")
    .map((row) => {
      const employee = findEmployeeByNip(karyawan, row.NIP);
      return createLaptopEntry({
        ...row,
        NamaPengguna: employee?.Nama ?? row.NamaPengguna,
        SBU: employee?.SBU ?? row.SBU,
      });
    });

  const skippedCount = rawRows.length - newEntries.length;
  const logEntries = rawRows.length
    ? [
        createLogEntry({
          nip: "SYSTEM",
          name: "SYSTEM",
          type: "laptop upload",
          oldValue: `${rawRows.length} baris diproses`,
          newValue: `${newEntries.length} baru ditambahkan, ${skippedCount} dilewati (data tidak valid)`,
        }),
      ]
    : [];

  return {
    changes: { laptop: [...laptop, ...newEntries], logEntries },
    toast: {
      message:
        skippedCount > 0
          ? `✅ ${newEntries.length} data laptop ditambahkan. ⚠ ${skippedCount} baris dilewati (tidak valid).`
          : `✅ ${newEntries.length} data laptop berhasil disimpan.`,
      durationMs: 5000,
    },
    destination: { page: "dashboard-laptop" },
  };
}

export const laptopUpload = {
  label: "Monitoring Pengadaan Laptop",
  icon: "💻",
  columns: COLUMNS,
  rowIdentityFields: ["NIP", "NamaPerangkat", "SerialNumber"],
  allowPartialHeaderMatch: true,
  rowStatuses: ROW_STATUSES,
  summaryCards: SUMMARY_CARDS,
  classifyRows,
  planUpload,
};
