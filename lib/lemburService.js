import {
  DEFAULT_SBU,
  LEMBUR_BILLING_TYPES,
  MAN_FEE_RATE,
  MONTHLY_PAGU_STATIC,
} from "./config";
import { createLemburEntry } from "./models";
import { findEmployeeByNip, formatRupiah } from "./utils";

const [SPPD_BILLING_TYPE, LEMBUR_BILLING_TYPE] = LEMBUR_BILLING_TYPES;

const toPercent = (part, whole) => (whole !== 0 ? (part / whole) * 100 : 0);
const sumNominal = (entries) =>
  entries.reduce((sum, entry) => sum + (Number(entry.Nominal) || 0), 0);

export const describeLemburEntry = ({ Tagihan, Bulan, Nominal }) =>
  `${Tagihan} · ${Bulan} · ${formatRupiah(Nominal)}`;

// Nama/SBU/Jabatan diambil dari Data Karyawan. Bila karyawan sudah tidak ada (resign/dihapus)
// dan NIP-nya sama dengan data lembur yang sedang diedit, data arsip dipertahankan agar tidak hilang dari Realisasi.
export function resolveLemburIdentity(employees, nip, existingEntry = null) {
  const employee = findEmployeeByNip(employees, nip);
  if (employee)
    return {
      Nama: employee.Nama,
      SBU: employee.SBU,
      Jabatan: employee.Jabatan,
      source: "employee",
    };

  if (existingEntry && existingEntry.NIP === String(nip || "").trim()) {
    return {
      Nama: existingEntry.Nama,
      SBU: existingEntry.SBU,
      Jabatan: existingEntry.Jabatan,
      source: "archive",
    };
  }
  return { Nama: "", SBU: "", Jabatan: "", source: "none" };
}

// Normalisasi data lama saat dimuat ("SPPD 1" → "SPPD 1 2", bulan tanpa tahun) dan
// lengkapi Nama/SBU/Jabatan yang kosong lewat NIP
export function normalizeLoadedLembur(rawEntries, employees) {
  return rawEntries.map((rawEntry) => {
    const entry = createLemburEntry(rawEntry);
    if (entry.SBU && entry.Nama) return entry;

    const employee = findEmployeeByNip(employees, entry.NIP);
    return employee
      ? {
          ...entry,
          Nama: employee.Nama,
          SBU: employee.SBU,
          Jabatan: employee.Jabatan,
        }
      : entry;
  });
}

export function buildNonPoDashboard(monthEntries, sbuConfigs) {
  const rows = DEFAULT_SBU.map((sbuName) => {
    const annualPaguNonPo = Number(sbuConfigs[sbuName]?.paguNonPO) || 0;
    const annualBnlp = Number(sbuConfigs[sbuName]?.bnlp) || 0;

    const sbuEntries = monthEntries.filter((entry) => entry.SBU === sbuName);
    const sppdEntries = sbuEntries.filter(
      (entry) => entry.Tagihan === SPPD_BILLING_TYPE,
    );
    const lemburEntries = sbuEntries.filter(
      (entry) => entry.Tagihan === LEMBUR_BILLING_TYPE,
    );

    const sppdRealization = sumNominal(sppdEntries);
    const lemburRealization = sumNominal(lemburEntries);
    const totalRealization = sppdRealization + lemburRealization;
    const bnlpPerMonth = annualBnlp / 12;
    const maxTopupPerMonth = bnlpPerMonth - MONTHLY_PAGU_STATIC;

    return {
      sbuName,
      annualPaguNonPo,
      paguPerUnit: annualPaguNonPo / 12,
      annualBnlp,
      bnlpPerMonth,
      maxTopupPerMonth,
      sppdCount: sppdEntries.length,
      lemburCount: lemburEntries.length,
      totalSubmissions: sbuEntries.length,
      sppdRealization,
      lemburRealization,
      totalRealization,
      realizationVsMaxTopupPercent: toPercent(
        totalRealization,
        maxTopupPerMonth,
      ),
      monthlyPagu: MONTHLY_PAGU_STATIC,
      percentage: toPercent(totalRealization, MONTHLY_PAGU_STATIC),
    };
  });

  // Dihitung dari SEMUA data bulan ini, bukan jumlah baris SBU, sehingga data karyawan resign/terhapus
  // tidak mengurangi Total Realisasi
  const totalRealization = sumNominal(monthEntries);
  const manFee = totalRealization * MAN_FEE_RATE;

  return {
    rows,
    totalRealization,
    manFee,
    grandTotal: totalRealization + manFee,
  };
}
