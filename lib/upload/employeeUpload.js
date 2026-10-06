import { DEFAULT_NO_SP2K, DEFAULT_PJTK } from '../config';
import { syncEmployeePrices } from '../employeeMaintenance';
import { createEmployee, createLogEntry } from '../models';
import { buildSlotConfigFromEmployees } from '../slotService';
import { getMostCommonValue, getTodayDate } from '../utils';

const COLUMNS = [
  { header: 'NIP', field: 'NIP', isMono: true },
  { header: 'Nama', field: 'Nama' },
  { header: 'NIK', field: 'NIK', isMono: true },
  { header: 'Grade', field: 'Grade' },
  { header: 'Jabatan', field: 'Jabatan' },
  { header: 'SBU', field: 'SBU' },
  { header: 'Gaji Pokok', field: 'GajiPokok' },
  { header: 'Harga Satuan', field: 'HargaSatuan' },
  { header: 'PJTK', field: 'PJTK' },
  { header: 'No. SP2K', field: 'NoSP2K' },
  { header: 'Nama TL', field: 'NamaTL' },
  { header: 'Sub Bidang', field: 'SubBidang' },
  { header: 'BKO Jabatan', field: 'BKOJabatan' },
  { header: 'BKO SBU', field: 'BKOSBU' },
  { header: 'NIP Baru', field: 'NIPBaru' },
  { header: 'Email', field: 'Email' },
  { header: 'Email Korporat', field: 'EmailKorporat' },
  { header: 'Nama Akun ICRM', field: 'NamaAkunICRM' },
  { header: 'Tanggal Masuk', field: 'TglMasuk' },
  { header: 'Tanggal Keluar', field: 'TglKeluar' },
  { header: 'Ukuran Baju', field: 'UkuranBaju' },
  { header: 'Nomor Telpon', field: 'NoTelp' },
  { header: 'Status', field: 'Status' },
  { header: 'Catatan Status', field: 'StatusCatatan' },
];

// Status & StatusCatatan sengaja tidak ada: perubahan status harus lewat edit manual agar histori terjaga
const MERGEABLE_FIELDS = [
  'Nama', 'NIK', 'Grade', 'Jabatan', 'SBU', 'GajiPokok', 'HargaSatuan', 'PJTK', 'NoSP2K', 'NamaTL', 'SubBidang',
  'BKOJabatan', 'BKOSBU', 'NIPBaru', 'Email', 'EmailKorporat', 'NamaAkunICRM', 'TglMasuk', 'TglKeluar',
  'UkuranBaju', 'NoTelp',
];

const ROW_STATUSES = {
  new: { label: '✔ Baru', variant: 'green' },
  nip_changed: { label: '🔁 NIP Diperbarui (NIK cocok)', variant: 'blue' },
  duplicate_existing: { label: '🧩 NIP Sudah Ada (lengkapi kolom kosong)', variant: 'blue' },
  duplicate_in_file: { label: '⚠ Duplikat di File', variant: 'yellow', isSkipped: true },
  invalid: { label: '✕ NIP Kosong', variant: 'red', isSkipped: true },
};

const SUMMARY_CARDS = [
  { label: '✔ Data Baru (akan ditambahkan)', tone: 'success', statuses: ['new'] },
  { label: '🔁 NIP Diperbarui (NIK cocok)', tone: 'accent', statuses: ['nip_changed'] },
  { label: '🧩 NIP Sudah Ada (lengkapi kolom kosong)', tone: 'accent', statuses: ['duplicate_existing'] },
  { label: '⚠ Duplikat di Dalam File', tone: 'warning', statuses: ['duplicate_in_file'] },
  { label: '✕ NIP Kosong (tidak valid)', tone: 'danger', statuses: ['invalid'] },
];

const isEmptyValue = (value) => value === '' || value === null || value === undefined || value === 0;

// NIP = Primary Key. NIK dianggap tidak pernah berubah, jadi NIP baru dengan NIK lama = NIP berganti, bukan orang baru
function classifyRows(rawRows, { karyawan: employees }) {
  const existingNips = new Set(employees.map((employee) => employee.NIP).filter(Boolean));
  const existingNiks = new Set(employees.map((employee) => employee.NIK).filter(Boolean));
  const nipsSeenInFile = new Set();

  return rawRows.map((row) => {
    const nip = row.NIP.trim();
    const nik = row.NIK.trim();
    let uploadStatus;

    if (!nip) uploadStatus = 'invalid';
    else if (existingNips.has(nip)) uploadStatus = 'duplicate_existing';
    else if (nipsSeenInFile.has(nip)) uploadStatus = 'duplicate_in_file';
    else {
      nipsSeenInFile.add(nip);
      uploadStatus = nik && existingNiks.has(nik) ? 'nip_changed' : 'new';
    }
    return { ...row, uploadStatus };
  });
}

// Hanya mengisi kolom yang MASIH KOSONG; kolom yang sudah terisi tidak ditimpa
function fillEmptyFields(existingEmployee, rawRow) {
  const incomingEmployee = createEmployee({ ...rawRow, id: existingEmployee.id, NIP: existingEmployee.NIP });
  const filledEmployee = { ...existingEmployee };
  const changes = [];

  MERGEABLE_FIELDS.forEach((field) => {
    if (isEmptyValue(existingEmployee[field]) && !isEmptyValue(incomingEmployee[field])) {
      changes.push(`${field}: '${existingEmployee[field] || '-'}' → '${incomingEmployee[field]}'`);
      filledEmployee[field] = incomingEmployee[field];
    }
  });

  if (changes.length) filledEmployee.TglUpdate = getTodayDate();
  return { filledEmployee, changes };
}

function buildToast(stats) {
  const skippedCount = stats.duplicateInFileCount + stats.invalidCount;
  const messageParts = [
    skippedCount > 0 ? `✅ ${stats.addedCount} data baru ditambahkan.` : `✅ ${stats.addedCount} karyawan baru berhasil disimpan.`,
    stats.nipUpdatedCount > 0 && `🔁 ${stats.nipUpdatedCount} NIP diperbarui (NIK cocok, data lama disambungkan ke NIP baru).`,
    stats.filledCount > 0 && `🧩 ${stats.filledCount} karyawan dilengkapi kolom kosongnya dari file ini.`,
    skippedCount > 0 && `⚠ ${skippedCount} baris dilewati (duplikat di file/tidak valid).`,
    stats.slotConfigBuilt && '📊 Slot Jabatan per SBU otomatis dibangun mengikuti jumlah karyawan di file ini (bisa disesuaikan lewat Edit Slot).',
  ].filter(Boolean);

  return { message: messageParts.join(' '), durationMs: messageParts.length > 1 ? 6500 : 3000 };
}

function planUpload(rawRows, { karyawan, lembur, laptop, slotConfig }) {
  const classifiedRows = classifyRows(rawRows, { karyawan });
  const rowsWithStatus = (status) => classifiedRows.filter((row) => row.uploadStatus === status);
  const logEntries = [];

  // 1. Karyawan baru: PJTK & No. SP2K yang kosong diisi nilai paling umum di data yang ada
  const defaultPjtk = getMostCommonValue(karyawan, 'PJTK') || DEFAULT_PJTK;
  const defaultNoSp2k = getMostCommonValue(karyawan, 'NoSP2K') || DEFAULT_NO_SP2K;
  const newEmployees = rowsWithStatus('new').map((row) =>
    createEmployee({ ...row, PJTK: row.PJTK.trim() || defaultPjtk, NoSP2K: row.NoSP2K.trim() || defaultNoSp2k })
  );

  let employees = [...karyawan, ...newEmployees];
  let updatedLembur = lembur;
  let updatedLaptop = laptop;
  const replaceEmployee = (updatedEmployee) => {
    employees = employees.map((employee) => (employee.id === updatedEmployee.id ? updatedEmployee : employee));
  };

  // 2. NIP berganti: perbarui NIP lama, sambungkan data Lembur & Laptop miliknya
  let nipUpdatedCount = 0;
  rowsWithStatus('nip_changed').forEach((row) => {
    const newNip = row.NIP.trim();
    const employee = employees.find((existing) => existing.NIK === row.NIK.trim());
    if (!employee) return;

    const oldNip = employee.NIP;
    const replaceNip = (entry) => (entry.NIP === oldNip ? { ...entry, NIP: newNip } : entry);
    replaceEmployee({ ...employee, NIP: newNip });
    updatedLembur = updatedLembur.map(replaceNip);
    updatedLaptop = updatedLaptop.map(replaceNip);

    logEntries.push(
      createLogEntry({
        nip: newNip,
        name: employee.Nama,
        type: 'nip diperbarui',
        oldValue: oldNip,
        newValue: newNip,
        note: 'NIP berganti (terdeteksi dari NIK yang sama) — data Lembur/SPPD & Laptop ikut disesuaikan',
      })
    );
    nipUpdatedCount += 1;
  });

  // 3. NIP sudah terdaftar: hanya lengkapi kolom kosong
  let filledCount = 0;
  rowsWithStatus('duplicate_existing').forEach((row) => {
    const employee = employees.find((existing) => existing.NIP === row.NIP.trim());
    if (!employee) return;

    const { filledEmployee, changes } = fillEmptyFields(employee, row);
    if (!changes.length) return;

    replaceEmployee(filledEmployee);
    logEntries.push(
      createLogEntry({
        nip: employee.NIP,
        name: employee.Nama,
        type: 'lengkapi data',
        newValue: changes.join(', '),
        note: 'Kolom kosong dilengkapi otomatis dari upload (NIP sudah terdaftar)',
      })
    );
    filledCount += 1;
  });

  // 4. Slot Fix dibentuk SEKALI saja, saat belum pernah ada; setelah itu hanya lewat "Edit Slot"
  const shouldBuildSlotConfig = Object.keys(slotConfig).length === 0 && newEmployees.length > 0;
  const nextSlotConfig = shouldBuildSlotConfig ? buildSlotConfigFromEmployees(newEmployees) : slotConfig;

  const stats = {
    totalRows: classifiedRows.length,
    addedCount: newEmployees.length,
    nipUpdatedCount,
    filledCount,
    duplicateInFileCount: rowsWithStatus('duplicate_in_file').length,
    invalidCount: rowsWithStatus('invalid').length,
    slotConfigBuilt: shouldBuildSlotConfig,
  };

  if (stats.totalRows > 0) {
    logEntries.push(
      createLogEntry({
        nip: 'SYSTEM',
        name: 'SYSTEM',
        type: 'upload',
        oldValue: `${stats.totalRows} baris diproses`,
        newValue:
          `${stats.addedCount} baru ditambahkan, ${stats.nipUpdatedCount} NIP diperbarui (NIK cocok), ` +
          `${stats.filledCount} data dilengkapi (NIP sudah ada), ${stats.duplicateInFileCount} duplikat di dalam file dilewati, ` +
          `${stats.invalidCount} NIP kosong dilewati`,
      })
    );
  }

  return {
    changes: {
      karyawan: syncEmployeePrices(employees).employees,
      lembur: updatedLembur,
      laptop: updatedLaptop,
      slotConfig: nextSlotConfig,
      logEntries,
    },
    toast: buildToast(stats),
    destination: { page: 'dashboard' },
  };
}

export const employeeUpload = {
  label: 'Data Karyawan',
  icon: '👥',
  columns: COLUMNS,
  rowIdentityFields: ['NIP', 'Nama'],
  rowStatuses: ROW_STATUSES,
  summaryCards: SUMMARY_CARDS,
  classifyRows,
  planUpload,
};