import {
  generateId,
  getTodayDate,
  normalizeEmployeeStatus,
  normalizePhone,
  parseNominal,
  resolveJabatanName,
  resolveSbuName,
  normalizeBulan,
  normalizeBillingType,
  normalizeLaptopStatus,
} from "./utils";

const toTrimmedText = (value) => String(value || "").trim();

export function createLogEntry({
  nip,
  name,
  type,
  oldValue,
  newValue,
  note = "",
}) {
  return {
    id: generateId(),
    ts: getTodayDate(),
    nik: nip,
    nama: name,
    type,
    oldVal: oldValue || "-",
    newVal: newValue || "-",
    catatan: note,
  };
}

export function createEmployee(data = {}) {
  return {
    id: data.id || generateId(),
    NIP: toTrimmedText(data.NIP),
    Nama: toTrimmedText(data.Nama),
    NIK: toTrimmedText(data.NIK),
    Grade: toTrimmedText(data.Grade).toUpperCase(),
    Jabatan: resolveJabatanName(toTrimmedText(data.Jabatan)),
    SBU: resolveSbuName(toTrimmedText(data.SBU)),
    GajiPokok: parseNominal(data.GajiPokok),
    HargaSatuan: parseNominal(data.HargaSatuan),
    PJTK: toTrimmedText(data.PJTK),
    NoSP2K: toTrimmedText(data.NoSP2K),
    NamaTL: toTrimmedText(data.NamaTL),
    SubBidang: toTrimmedText(data.SubBidang),
    BKOJabatan: resolveJabatanName(toTrimmedText(data.BKOJabatan)),
    BKOSBU: resolveSbuName(toTrimmedText(data.BKOSBU)),
    NIPBaru: toTrimmedText(data.NIPBaru),
    Email: toTrimmedText(data.Email),
    EmailKorporat: toTrimmedText(data.EmailKorporat),
    NamaAkunICRM: toTrimmedText(data.NamaAkunICRM),
    TglMasuk: toTrimmedText(data.TglMasuk),
    TglKeluar: toTrimmedText(data.TglKeluar),
    UkuranBaju: toTrimmedText(data.UkuranBaju).toUpperCase(),
    NoTelp: normalizePhone(data.NoTelp),
    TglUpdate: data.TglUpdate || getTodayDate(),
    Status: normalizeEmployeeStatus(data.Status),
    StatusManual:
      typeof data.StatusManual === "boolean" ? data.StatusManual : false,
    StatusCatatan: data.StatusCatatan || "",
  };
}

export function createLemburEntry(data = {}) {
  return {
    id: data.id || generateId(),
    NIP: toTrimmedText(data.NIP),
    Nama: toTrimmedText(data.Nama),
    Nominal: parseNominal(data.Nominal),
    SBU: resolveSbuName(toTrimmedText(data.SBU)),
    Jabatan: resolveJabatanName(toTrimmedText(data.Jabatan)),
    Bulan: normalizeBulan(data.Bulan),
    Tagihan: normalizeBillingType(data.Tagihan), // 'SPPD 1 2' | 'Lembur'
  };
}

export function createLaptopEntry(data = {}) {
  return {
    id: data.id || generateId(),
    NIP: toTrimmedText(data.NIP),
    NamaPerangkat: toTrimmedText(data.NamaPerangkat),
    PA: toTrimmedText(data.PA),
    NamaPengguna: toTrimmedText(data.NamaPengguna),
    SerialNumber: toTrimmedText(data.SerialNumber),
    SBU: resolveSbuName(toTrimmedText(data.SBU)),
    Status: normalizeLaptopStatus(data.Status),
    BuktiBA: data.BuktiBA || null, // gambar base64 (dikompres), diupload manual
    BuktiBAFileName: data.BuktiBAFileName || null,
  };
}
