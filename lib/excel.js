import { getTodayDate, toFileNamePart } from "./utils";
import { LAPTOP_COUNT_COLUMNS } from "./laptopService";

const EMPLOYEE_EXPORT_COLUMNS = [
  ["NIP", "NIP"],
  ["Nama", "Nama"],
  ["NIK", "NIK"],
  ["Grade", "Grade"],
  ["Jabatan", "Jabatan"],
  ["SBU", "SBU"],
  ["Gaji Pokok", "GajiPokok"],
  ["Harga Satuan", "HargaSatuan"],
  ["PJTK", "PJTK"],
  ["No. SP2K", "NoSP2K"],
  ["Nama TL", "NamaTL"],
  ["Sub Bidang", "SubBidang"],
  ["BKO Jabatan", "BKOJabatan"],
  ["BKO SBU", "BKOSBU"],
  ["NIP Baru", "NIPBaru"],
  ["Email", "Email"],
  ["Email Korporat", "EmailKorporat"],
  ["Nama Akun ICRM", "NamaAkunICRM"],
  ["Tanggal Masuk", "TglMasuk"],
  ["Tanggal Keluar", "TglKeluar"],
  ["Ukuran Baju", "UkuranBaju"],
  ["Nomor Telpon", "NoTelp"],
  ["Tanggal Update", "TglUpdate"],
  ["Status", "Status"],
  ["Catatan Status", "StatusCatatan"],
];

const normalizeHeader = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export async function readSheetRows(file) {
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" });
}

function findColumnIndex(
  normalizedHeaders,
  normalizedAliases,
  allowPartialMatch,
) {
  const exactIndex = normalizedHeaders.findIndex((header) =>
    normalizedAliases.includes(header),
  );
  if (exactIndex !== -1 || !allowPartialMatch) return exactIndex;

  // Alias pendek (mis. "pa") tidak boleh dicocokkan sebagian agar tidak nyangkut ke kolom lain
  return normalizedHeaders.findIndex((header) =>
    normalizedAliases.some(
      (alias) => alias.length >= 4 && header.includes(alias),
    ),
  );
}

// Header dicocokkan tanpa memedulikan huruf besar/kecil, spasi, dan tanda baca
export function mapRowsToObjects(
  sheetRows,
  columns,
  { allowPartialMatch = false } = {},
) {
  const [headerRow = [], ...dataRows] = sheetRows;
  const normalizedHeaders = headerRow.map(normalizeHeader);

  const columnIndexes = columns.map(({ header, aliases = [header] }) =>
    findColumnIndex(
      normalizedHeaders,
      aliases.map(normalizeHeader),
      allowPartialMatch,
    ),
  );

  return dataRows.map((row) =>
    Object.fromEntries(
      columns.map(({ field }, columnPosition) => {
        const sheetIndex = columnIndexes[columnPosition];
        return [field, sheetIndex >= 0 ? String(row[sheetIndex] ?? "") : ""];
      }),
    ),
  );
}

export async function parseUploadFile(
  file,
  { columns, rowIdentityFields, allowPartialHeaderMatch = false },
) {
  const sheetRows = await readSheetRows(file);
  return mapRowsToObjects(sheetRows, columns, {
    allowPartialMatch: allowPartialHeaderMatch,
  }).filter((row) => rowIdentityFields.some((field) => row[field].trim()));
}

async function downloadWorkbook(fileName, sheets) {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();
  sheets.forEach(({ name, rows }) =>
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(rows),
      name,
    ),
  );
  XLSX.writeFile(workbook, fileName);
}

const toLogSheetRows = (logEntries, identityHeader = "NIP") =>
  logEntries.map((entry) => ({
    Tanggal: entry.ts,
    [identityHeader]: entry.nik,
    Nama: entry.nama,
    "Tipe Ubah": entry.type.toUpperCase(),
    "Data Lama": entry.oldVal,
    "Data Baru": entry.newVal,
    Catatan: entry.catatan,
  }));

export async function exportEmployeesToExcel({
  employees,
  logEntries = [],
  fileSuffix = "",
}) {
  const sheets = [
    {
      name: "Data Karyawan",
      rows: employees.map((employee) =>
        Object.fromEntries(
          EMPLOYEE_EXPORT_COLUMNS.map(([header, field]) => [
            header,
            employee[field],
          ]),
        ),
      ),
    },
  ];
  if (logEntries.length)
    sheets.push({ name: "Log Perubahan", rows: toLogSheetRows(logEntries) });

  await downloadWorkbook(
    `data-karyawan${fileSuffix ? `-${fileSuffix}` : ""}-${getTodayDate()}.xlsx`,
    sheets,
  );
}

export async function exportLemburEntries({ entries, logEntries, monthLabel }) {
  const sheets = [
    {
      name: "Data Lembur SPPD",
      rows: entries.map(
        ({ NIP, Nama, Nominal, SBU, Jabatan, Bulan, Tagihan }) => ({
          NIP,
          Nama,
          Nominal,
          SBU,
          Jabatan,
          Bulan,
          Tagihan,
        }),
      ),
    },
  ];
  if (logEntries.length) {
    sheets.push({
      name: "Log Perubahan Lembur",
      rows: toLogSheetRows(logEntries, "NIP/SBU"),
    });
  }
  await downloadWorkbook(
    `data-lembur-sppd-${toFileNamePart(monthLabel)}-${getTodayDate()}.xlsx`,
    sheets,
  );
}

export async function exportNonPoDashboard({ dashboard, monthLabel }) {
  const { rows, totalRealization, manFee, grandTotal } = dashboard;
  const sheets = [
    {
      name: "Dashboard Non PO",
      rows: rows.map((row) => ({
        SBU: row.sbuName,
        "PAGU Non PO (Tahunan)": row.annualPaguNonPo,
        "PAGU per Unit sebelum Man Fee": row.paguPerUnit,
        "BNLP (Tahunan)": row.annualBnlp,
        "BNLP per Bulan": row.bnlpPerMonth,
        "Max Topup per Bulan": row.maxTopupPerMonth,
        "Jumlah Karyawan SPPD 1 2": row.sppdCount,
        "Jumlah Karyawan Lembur": row.lemburCount,
        "Total Pengajuan per SBU": row.totalSubmissions,
        "Realisasi SPPD 1 2": row.sppdRealization,
        "Realisasi Lembur": row.lemburRealization,
        "Realisasi SPPD/Lembur (Total)": row.totalRealization,
        "Realisasi/Max Topup (%)": Number(
          row.realizationVsMaxTopupPercent.toFixed(2),
        ),
        "PAGU per Bulan": row.monthlyPagu,
        "Persentase (%)": Number(row.percentage.toFixed(2)),
      })),
    },
    {
      name: "Ringkasan",
      rows: [
        { Keterangan: "Total Realisasi SPPD/Lembur", Nilai: totalRealization },
        { Keterangan: "Man Fee (7%)", Nilai: manFee },
        { Keterangan: "Grand Total", Nilai: grandTotal },
      ],
    },
  ];
  await downloadWorkbook(
    `dashboard-non-po-${toFileNamePart(monthLabel)}-${getTodayDate()}.xlsx`,
    sheets,
  );
}

export async function exportLaptopTable({ rows, logEntries }) {
  const sheets = [
    {
      name: "Monitoring Laptop",
      rows: rows.map((row, index) => ({
        No: index + 1,
        NIP: row.NIP,
        "Nama Perangkat": row.NamaPerangkat,
        PA: row.PA,
        "Nama Pengguna": row.NamaPengguna,
        Jabatan: row.Jabatan,
        Grade: row.Grade,
        "Serial Number": row.SerialNumber,
        "Regional (SBU)": row.SBU,
        "Status Laptop": row.Status,
        "Bukti Berita Acara": row.BuktiBA ? "Ada" : "Belum Ada",
      })),
    },
  ];
  if (logEntries.length)
    sheets.push({
      name: "Log Perubahan Laptop",
      rows: toLogSheetRows(logEntries),
    });
  await downloadWorkbook(`monitoring-laptop-${getTodayDate()}.xlsx`, sheets);
}

export async function exportLaptopDashboard({ sbuRows }) {
  const toCountColumns = (counts) =>
    Object.fromEntries(
      LAPTOP_COUNT_COLUMNS.map(({ key, exportHeader }) => [
        exportHeader,
        counts[key],
      ]),
    );

  await downloadWorkbook(`dashboard-laptop-${getTodayDate()}.xlsx`, [
    {
      name: "Per SBU",
      rows: sbuRows.map(({ sbuName, counts }) => ({
        SBU: sbuName,
        ...toCountColumns(counts),
      })),
    },
    {
      name: "Per SBU & Jabatan",
      rows: sbuRows.flatMap(({ sbuName, jabatanRows }) =>
        jabatanRows.map(({ jabatanName, counts }) => ({
          SBU: sbuName,
          Jabatan: jabatanName,
          ...toCountColumns(counts),
        })),
      ),
    },
  ]);
}
