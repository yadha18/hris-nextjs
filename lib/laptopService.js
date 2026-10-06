import {
  DEFAULT_SBU,
  LAPTOP_EXCLUDED_JABATAN,
  LAPTOP_STATUS_MISSING,
  LAPTOP_STATUS_NOT_ENTITLED,
  LAPTOP_STATUS_OPTIONS,
} from "./config";
import { createLaptopEntry } from "./models";
import { findEmployeeByNip, isLaptopSerialReleased } from "./utils";

const [ACTIVE_STATUS, NOT_RETURNED_STATUS, RETURNED_STATUS] =
  LAPTOP_STATUS_OPTIONS;
const UNKNOWN_JABATAN_LABEL = "Tidak Diketahui";

// Satu sumber untuk kolom hitungan, dipakai tabel dashboard dan export Excel
export const LAPTOP_COUNT_COLUMNS = [
  { key: "total", header: "Total", exportHeader: "Total", isBold: true },
  {
    key: "physicalUnits",
    header: "💻 Unit Laptop",
    exportHeader: "Unit Laptop",
  },
  { key: "active", header: "🟢 Aktif", exportHeader: "Aktif" },
  {
    key: "notReturned",
    header: "🔴 Belum Dikembalikan",
    exportHeader: "Belum Dikembalikan",
  },
  {
    key: "returned",
    header: "✅ Sudah Dikembalikan",
    exportHeader: "Sudah Dikembalikan",
  },
  {
    key: "missing",
    header: "⛔ Belum Dapat Laptop",
    exportHeader: "Belum Dapat Laptop",
  },
  {
    key: "notEntitled",
    header: "🚫 Tidak Dapat Laptop",
    exportHeader: "Tidak Dapat Laptop",
  },
  {
    key: "unfilledStatus",
    header: "Belum Diisi Status",
    exportHeader: "Belum Diisi Status",
    isMuted: true,
  },
];

export const describeLaptopEntry = ({ NamaPerangkat, SerialNumber, Status }) =>
  `${NamaPerangkat} · ${SerialNumber} · ${Status || "(belum diisi)"}`;

export const findLaptopsByNip = (laptops, nip) =>
  nip && nip !== "0" ? laptops.filter((laptop) => laptop.NIP === nip) : [];

// Data asli + baris "virtual" untuk karyawan non-resign yang belum tercatat punya laptop.
// Jabatan yang tidak berhak laptop diberi status "Tidak Dapat Laptop", sisanya "Belum Dapat Laptop".
export function buildLaptopRows(employees, laptops) {
  const recordedRows = laptops.map((laptop) => {
    const holder = findEmployeeByNip(employees, laptop.NIP);
    return {
      ...laptop,
      Jabatan: holder?.Jabatan ?? "",
      Grade: holder?.Grade ?? "",
      isVirtual: false,
    };
  });

  const nipsWithLaptop = new Set(
    laptops.map((laptop) => laptop.NIP).filter(Boolean),
  );
  const virtualRows = employees
    .filter(
      (employee) =>
        employee.Status !== "Resign" &&
        employee.NIP &&
        !nipsWithLaptop.has(employee.NIP),
    )
    .map((employee) => ({
      id: `missing-${employee.id}`,
      NIP: employee.NIP,
      NamaPerangkat: "",
      PA: "",
      NamaPengguna: employee.Nama,
      SerialNumber: "",
      SBU: employee.SBU,
      Jabatan: employee.Jabatan,
      Grade: employee.Grade,
      Status: LAPTOP_EXCLUDED_JABATAN.includes(employee.Jabatan)
        ? LAPTOP_STATUS_NOT_ENTITLED
        : LAPTOP_STATUS_MISSING,
      BuktiBA: null,
      BuktiBAFileName: null,
      isVirtual: true,
    }));

  return [...recordedRows, ...virtualRows];
}

// Unit FISIK unik per Serial Number. Laptop yang sudah dikembalikan tetap dihitung (unitnya masih ada).
export function countPhysicalLaptops(rows) {
  const unitIdentities = new Set();
  rows
    .filter((row) => !row.isVirtual)
    .forEach((row) => {
      const serialKey = row.SerialNumber.trim().toLowerCase();
      unitIdentities.add(serialKey ? `sn:${serialKey}` : `id:${row.id}`);
    });
  return unitIdentities.size;
}

export function summarizeLaptopRows(rows) {
  const countWithStatus = (status) =>
    rows.filter((row) => row.Status === status).length;
  return {
    total: rows.length,
    physicalUnits: countPhysicalLaptops(rows),
    active: countWithStatus(ACTIVE_STATUS),
    notReturned: countWithStatus(NOT_RETURNED_STATUS),
    returned: countWithStatus(RETURNED_STATUS),
    missing: countWithStatus(LAPTOP_STATUS_MISSING),
    notEntitled: countWithStatus(LAPTOP_STATUS_NOT_ENTITLED),
    unfilledStatus: rows.filter((row) => !row.Status).length,
  };
}

function groupRowsByJabatan(rows) {
  const rowsByJabatan = new Map();
  rows.forEach((row) => {
    const jabatanName = row.Jabatan || UNKNOWN_JABATAN_LABEL;
    rowsByJabatan.set(jabatanName, [
      ...(rowsByJabatan.get(jabatanName) ?? []),
      row,
    ]);
  });
  return [...rowsByJabatan.entries()].sort(([jabatanA], [jabatanB]) =>
    jabatanA.localeCompare(jabatanB),
  );
}

export function buildLaptopDashboard(rows) {
  const sbuRows = DEFAULT_SBU.map((sbuName) => {
    const sbuLaptopRows = rows.filter((row) => row.SBU === sbuName);
    return {
      sbuName,
      counts: summarizeLaptopRows(sbuLaptopRows),
      jabatanRows: groupRowsByJabatan(sbuLaptopRows).map(
        ([jabatanName, members]) => ({
          jabatanName,
          counts: summarizeLaptopRows(members),
          members: [...members].sort((memberA, memberB) =>
            (memberA.NamaPengguna || "").localeCompare(
              memberB.NamaPengguna || "",
            ),
          ),
        }),
      ),
    };
  });
  return { totals: summarizeLaptopRows(rows), sbuRows };
}

// Saran status: resign + belum ada bukti = Belum Dikembalikan, resign + ada bukti = Sudah Dikembalikan
export function suggestLaptopStatus(employees, nip, hasProof) {
  const holder = findEmployeeByNip(employees, nip);
  if (holder?.Status === "Resign")
    return hasProof ? RETURNED_STATUS : NOT_RETURNED_STATUS;
  return ACTIVE_STATUS;
}

// Mengembalikan pesan error, atau null bila valid
export function validateLaptopEntry(
  laptops,
  employees,
  candidate,
  editedEntryId = null,
) {
  const serialKey = candidate.SerialNumber.trim().toLowerCase();
  const serialHolder = laptops.find(
    (laptop) =>
      laptop.id !== editedEntryId &&
      laptop.SerialNumber.trim().toLowerCase() === serialKey &&
      !isLaptopSerialReleased(laptop, employees),
  );
  if (serialHolder) {
    const holderName =
      serialHolder.NamaPengguna || serialHolder.NIP || "(tanpa nama)";
    return `Serial Number "${candidate.SerialNumber}" masih dipakai oleh ${holderName} (status: ${serialHolder.Status || "Belum Diisi"})!`;
  }

  const employee = candidate.NIP
    ? findEmployeeByNip(employees, candidate.NIP)
    : null;
  if (employee && LAPTOP_EXCLUDED_JABATAN.includes(employee.Jabatan)) {
    return `Jabatan "${employee.Jabatan}" tergolong Tidak Dapat Laptop, tidak bisa ditambahkan/diedit.`;
  }

  if (candidate.NIP && candidate.Status === ACTIVE_STATUS) {
    const otherActiveLaptop = laptops.find(
      (laptop) =>
        laptop.id !== editedEntryId &&
        laptop.NIP === candidate.NIP &&
        laptop.Status === ACTIVE_STATUS,
    );
    if (otherActiveLaptop) {
      return `${candidate.NamaPengguna} sudah memiliki laptop aktif (${otherActiveLaptop.NamaPerangkat} · SN: ${otherActiveLaptop.SerialNumber}). Ubah status laptop lama terlebih dahulu.`;
    }
  }
  return null;
}

// Lengkapi Nama Pengguna / Regional yang kosong (data lama yang gagal ke-lookup saat upload)
export function normalizeLoadedLaptops(rawEntries, employees) {
  return rawEntries.map((rawEntry) => {
    const entry = createLaptopEntry(rawEntry);
    if (entry.SBU && entry.NamaPengguna) return entry;

    const holder = findEmployeeByNip(employees, entry.NIP);
    return holder
      ? { ...entry, NamaPengguna: holder.Nama, SBU: holder.SBU }
      : entry;
  });
}
