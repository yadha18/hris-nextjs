import {
  DEFAULT_JABATAN,
  DEFAULT_SBU,
  HARGA_SBU_GRADE,
  JABATAN_ALIAS_MAP,
  SBU_ALIAS_MAP,
  DEFAULT_LEMBUR_YEAR,
  DEFAULT_LEMBUR_YEARS,
  MONTH_NAMES,
} from "./config";

let lastGeneratedId = Date.now();

// Counter monotonic: menjamin ID unik walau dipanggil ratusan kali per milidetik
export function generateId() {
  lastGeneratedId += 1;
  return lastGeneratedId;
}

export function getTodayDate() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

export function countFullMonthsSince(dateString) {
  if (!dateString) return null;
  const startDate = new Date(dateString);
  if (Number.isNaN(startDate.getTime())) return null;

  const now = new Date();
  let fullMonths =
    (now.getFullYear() - startDate.getFullYear()) * 12 +
    (now.getMonth() - startDate.getMonth());
  if (now.getDate() < startDate.getDate()) fullMonths -= 1;
  return Math.max(0, fullMonths);
}

export function findPriceBySbuAndGrade(sbuName, gradeName) {
  if (!sbuName || !gradeName) return null;
  return (
    HARGA_SBU_GRADE.find(
      (price) => price.SBU === sbuName && price.Grade === gradeName,
    ) ?? null
  );
}

// endDateString kosong = sampai hari ini
export function countFullMonthsBetween(startDateString, endDateString = null) {
  if (!startDateString) return null;
  const startDate = new Date(startDateString);
  const endDate = endDateString ? new Date(endDateString) : new Date();
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()))
    return null;

  let fullMonths =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());
  if (endDate.getDate() < startDate.getDate()) fullMonths -= 1;
  return Math.max(0, fullMonths);
}

export function formatDurationMonths(totalMonths) {
  if (totalMonths === null || totalMonths === undefined) return "—";
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years > 0 && months > 0) return `${years} tahun ${months} bulan`;
  if (years > 0) return `${years} tahun`;
  return totalMonths === 0 ? "< 1 bulan" : `${totalMonths} bulan`;
}

export function formatDateId(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRupiah(amount) {
  return "Rp" + Math.round(Number(amount) || 0).toLocaleString("id-ID");
}

// Mengerti format Indonesia (1.500.000 / 1.500,50), format Excel biasa, dan awalan "Rp"
export function parseNominal(rawValue) {
  if (rawValue === null || rawValue === undefined) return 0;
  if (typeof rawValue === "number") return rawValue;

  let text = String(rawValue).trim().replace(/rp\.?/gi, "").replace(/\s/g, "");
  if (!text) return 0;

  const lastCommaIndex = text.lastIndexOf(",");
  const lastDotIndex = text.lastIndexOf(".");

  if (lastCommaIndex > -1 && lastDotIndex > -1) {
    text =
      lastCommaIndex > lastDotIndex
        ? text.replace(/\./g, "").replace(",", ".")
        : text.replace(/,/g, "");
  } else if (lastCommaIndex > -1) {
    const isThousandsSeparator = text.length - lastCommaIndex - 1 === 3;
    text = isThousandsSeparator
      ? text.replace(/,/g, "")
      : text.replace(",", ".");
  } else if (lastDotIndex > -1 && text.length - lastDotIndex - 1 === 3) {
    text = text.replace(/\./g, "");
  }

  const parsedNumber = parseFloat(text.replace(/[^0-9.\-]/g, ""));
  return Number.isNaN(parsedNumber) ? 0 : parsedNumber;
}

export function resolveSbuName(rawName) {
  if (!rawName) return rawName;
  const upperName = String(rawName).trim().toUpperCase();
  if (DEFAULT_SBU.includes(upperName)) return upperName;

  for (const { canonical, aliases } of SBU_ALIAS_MAP) {
    const longestAliasFirst = [...aliases].sort(
      (aliasA, aliasB) => aliasB.length - aliasA.length,
    );
    if (longestAliasFirst.some((alias) => upperName.includes(alias)))
      return canonical;
  }
  return upperName;
}

export function resolveJabatanName(rawName) {
  if (!rawName) return rawName;
  const upperName = String(rawName).trim().toUpperCase();
  if (DEFAULT_JABATAN.includes(upperName)) return upperName;

  const matchedEntry = JABATAN_ALIAS_MAP.find(({ aliases }) =>
    aliases.includes(upperName),
  );
  return matchedEntry ? matchedEntry.canonical : upperName;
}

const NEW_HIRE_STATUS_ALIASES = ["baru masuk", "baru", "new", "karyawan baru"];
const RESIGNED_STATUS_ALIASES = [
  "resign",
  "resigned",
  "keluar",
  "non aktif",
  "nonaktif",
  "non-aktif",
  "berhenti",
  "out",
];

export function normalizeEmployeeStatus(rawStatus) {
  const status = String(rawStatus || "")
    .trim()
    .toLowerCase();
  if (NEW_HIRE_STATUS_ALIASES.includes(status)) return "Baru Masuk";
  if (RESIGNED_STATUS_ALIASES.includes(status)) return "Resign";
  return "Aktif";
}

// 08xxx, 8xxx, 628xxx, +628xxx → +62xxx
export function normalizePhone(rawPhone) {
  if (!rawPhone) return "";
  let digits = String(rawPhone)
    .trim()
    .replace(/[\s\-()]/g, "")
    .replace(/^\+/, "");
  if (digits.startsWith("62")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  return digits ? `+62${digits}` : "";
}

// Urut berdasarkan angka Grade (1, 2, ... terbesar), bukan abjad
export function getGradeNumber(gradeName) {
  const gradeNumber = parseInt(
    (String(gradeName).match(/(\d+)\s*$/) || [])[1],
    10,
  );
  return Number.isNaN(gradeNumber) ? Infinity : gradeNumber;
}

// Urut berdasarkan angka Grade (1, 2, ... terbesar), bukan abjad
export function sortGradeList(gradeNames) {
  return [...gradeNames].sort(
    (gradeA, gradeB) =>
      getGradeNumber(gradeA) - getGradeNumber(gradeB) ||
      String(gradeA).localeCompare(String(gradeB)),
  );
}

export function getMostCommonValue(employees, fieldName) {
  const occurrenceByValue = {};
  employees.forEach((employee) => {
    const value = String(employee[fieldName] || "").trim();
    if (value) occurrenceByValue[value] = (occurrenceByValue[value] || 0) + 1;
  });
  const [mostCommonValue = ""] =
    Object.entries(occurrenceByValue).sort(
      ([, countA], [, countB]) => countB - countA,
    )[0] ?? [];
  return mostCommonValue;
}

// Toleran angka 0 di depan (NIP di Excel kadang kehilangan 0 awal)
export function findEmployeeByNip(employees, nip) {
  const trimmedNip = String(nip || "").trim();
  if (!trimmedNip) return null;

  const exactMatch = employees.find((employee) => employee.NIP === trimmedNip);
  if (exactMatch) return exactMatch;

  const nipWithoutLeadingZeros = trimmedNip.replace(/^0+/, "");
  if (!nipWithoutLeadingZeros) return null;
  return (
    employees.find(
      (employee) => employee.NIP.replace(/^0+/, "") === nipWithoutLeadingZeros,
    ) ?? null
  );
}

// "januari" / "Januari 2027" → "Januari 2026" / "Januari 2027"
export function normalizeBulan(rawMonth) {
  const text = String(rawMonth || "").trim();
  if (!text) return "";

  const matchedMonth = MONTH_NAMES.find((monthName) =>
    new RegExp(`^${monthName}`, "i").test(text),
  );
  if (!matchedMonth) return text;

  const yearMatch = text.match(/\b(20\d{2})\b/);
  const hasSupportedYear =
    yearMatch && DEFAULT_LEMBUR_YEARS.includes(Number(yearMatch[1]));
  return `${matchedMonth} ${hasSupportedYear ? yearMatch[1] : DEFAULT_LEMBUR_YEAR}`;
}

export function normalizeBillingType(rawBillingType) {
  const text = String(rawBillingType || "").trim();
  if (/^sppd/i.test(text)) return "SPPD 1 2";
  if (/^lembur$/i.test(text)) return "Lembur";
  return text;
}

export function normalizeLaptopStatus(rawStatus) {
  const text = String(rawStatus || "")
    .trim()
    .toLowerCase();
  if (!text) return "";
  if (text.startsWith("aktif")) return "Aktif";
  if (text.includes("belum")) return "Belum Dikembalikan";
  if (text.includes("sudah") || text.includes("kembali"))
    return "Sudah Dikembalikan";
  return "";
}

// Serial boleh dipakai ulang bila laptop sudah dikembalikan DAN pemegang lamanya Resign / sudah tidak terdaftar
export function isLaptopSerialReleased(laptopEntry, employees) {
  if (laptopEntry.Status !== "Sudah Dikembalikan") return false;
  const holder = findEmployeeByNip(employees, laptopEntry.NIP);
  return !holder || holder.Status === "Resign";
}

export const toFileNamePart = (text) =>
  String(text).replace(/[^a-zA-Z0-9]+/g, "-");

export function toggleSetMember(previousSet, member) {
  const nextSet = new Set(previousSet);
  if (nextSet.has(member)) nextSet.delete(member);
  else nextSet.add(member);
  return nextSet;
}
