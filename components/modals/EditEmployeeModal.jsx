'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@/components/ui/Button';
import { FormField, FormRow, SelectControl, TextControl } from '@/components/ui/FormField';
import InfoNote from '@/components/ui/InfoNote';
import Modal, { ModalActions } from '@/components/ui/Modal';
import {
  DEFAULT_GRADE, DEFAULT_JABATAN, DEFAULT_NO_SP2K, DEFAULT_PJTK, DEFAULT_SBU,
  EMPLOYEE_STATUS_OPTIONS, SHIRT_SIZES,
} from '@/lib/config';
import { findPriceBySbuAndGrade, getMostCommonValue, normalizePhone, sortGradeList } from '@/lib/utils';
import { saveEmployee } from '@/store/hrisActions';
import { closeModal, showToast } from '@/store/slices/uiSlice';

const FORM_FIELDS = [
  'NIP', 'Nama', 'NIK', 'UkuranBaju', 'Grade', 'Jabatan', 'SBU', 'PJTK', 'NoSP2K', 'NamaTL', 'SubBidang',
  'BKOJabatan', 'BKOSBU', 'NIPBaru', 'Email', 'EmailKorporat', 'NamaAkunICRM', 'NoTelp',
  'TglMasuk', 'TglKeluar', 'Status', 'StatusCatatan',
];

function buildInitialForm(editedEmployee, allEmployees) {
  if (editedEmployee) {
    const form = Object.fromEntries(FORM_FIELDS.map((field) => [field, editedEmployee[field] ?? '']));
    return { ...form, NoTelp: editedEmployee.NoTelp || '+62' };
  }
  return {
    ...Object.fromEntries(FORM_FIELDS.map((field) => [field, ''])),
    Status: 'Aktif',
    NoTelp: '+62',
    PJTK: getMostCommonValue(allEmployees, 'PJTK') || DEFAULT_PJTK,
    NoSP2K: getMostCommonValue(allEmployees, 'NoSP2K') || DEFAULT_NO_SP2K,
  };
}

export default function EditEmployeeModal({ employeeId }) {
  const dispatch = useDispatch();
  const employees = useSelector((state) => state.hris.karyawan);
  const jabatanList = useSelector((state) => state.hris.jabatan);
  const subBidangList = useSelector((state) => state.hris.subBidang);

  const editedEmployee = employeeId === null ? null : employees.find((employee) => employee.id === employeeId);
  const [form, setForm] = useState(() => buildInitialForm(editedEmployee, employees));

  const setField = (field, value) => setForm((previous) => ({ ...previous, [field]: value }));
  const bind = (field) => ({ value: form[field], onChange: (event) => setField(field, event.target.value) });

  // Memilih BKO Jabatan langsung menyamakan Jabatan (aturan final ditegakkan lagi saat simpan)
  const handleBkoJabatanChange = (event) => {
    const bkoJabatan = event.target.value;
    setForm((previous) => ({ ...previous, BKOJabatan: bkoJabatan, Jabatan: bkoJabatan || previous.Jabatan }));
  };

  const gradeOptions = sortGradeList(DEFAULT_GRADE);
  const legacyGrade = editedEmployee?.Grade;
  const gradeSelectOptions =
    legacyGrade && !gradeOptions.includes(legacyGrade)
      ? [...gradeOptions, { value: legacyGrade, label: `${legacyGrade} (lama)` }]
      : gradeOptions;

  const price = findPriceBySbuAndGrade(form.SBU, form.Grade);

  const handleSubmit = () => {
    if (!form.NIP.trim() || !form.Nama.trim()) return dispatch(showToast('❌ NIP dan Nama wajib diisi!'));

    const { Status, StatusCatatan, ...employeeFields } = form;
    const formData = {
      ...employeeFields,
      Jabatan: form.BKOJabatan || form.Jabatan,
      GajiPokok: price?.GajiPokok ?? '',
      HargaSatuan: price?.HargaSatuan ?? '',
    };

    const result = dispatch(saveEmployee({ employeeId, formData, statusData: { Status, Catatan: StatusCatatan.trim() } }));
    if (!result.success) {
      const message =
        result.error === 'duplicate'
          ? `❌ NIP "${form.NIP.trim()}" sudah terdaftar! NIP tidak boleh duplikat.`
          : '❌ Gagal menyimpan data.';
      return dispatch(showToast(message, 4000));
    }

    if (employeeId === null) dispatch(showToast('✅ Karyawan ditambahkan!'));
    else if (form.BKOJabatan) dispatch(showToast(`✅ Data diperbarui! Jabatan otomatis disesuaikan mengikuti BKO Jabatan: ${form.BKOJabatan}`, 5000));
    else dispatch(showToast('✅ Data diperbarui!'));
    dispatch(closeModal());
  };

  return (
    <Modal title="✏️ Form Edit Karyawan" onClose={() => dispatch(closeModal())} widthClass="max-w-[700px]">
      <FormRow>
        <FormField label="NIP"><TextControl placeholder="ex: 123456789ICN" {...bind('NIP')} /></FormField>
        <FormField label="Nama"><TextControl {...bind('Nama')} /></FormField>
      </FormRow>
      <FormRow>
        <FormField label="NIK"><TextControl placeholder="Nomor Induk Kependudukan" {...bind('NIK')} /></FormField>
        <FormField label="Ukuran Baju"><SelectControl placeholder="— Pilih Ukuran —" options={SHIRT_SIZES} {...bind('UkuranBaju')} /></FormField>
      </FormRow>
      <FormRow>
        <FormField label="Grade"><SelectControl placeholder="— Pilih Grade —" options={gradeSelectOptions} {...bind('Grade')} /></FormField>
      </FormRow>
      <FormRow>
        <FormField label="Jabatan">
          <SelectControl placeholder="— Pilih Jabatan —" options={jabatanList.map(({ nama }) => nama)} {...bind('Jabatan')} />
        </FormField>
        <FormField label="SBU"><SelectControl placeholder="— Pilih SBU —" options={DEFAULT_SBU} {...bind('SBU')} /></FormField>
      </FormRow>
      <FormRow>
        <FormField label="Gaji Pokok" labelNote="(otomatis dari SBU & Grade)">
          <TextControl type="number" readOnly placeholder="Pilih Grade & SBU dahulu" value={price?.GajiPokok ?? ''} />
        </FormField>
        <FormField label="Harga Satuan" labelNote="(otomatis dari SBU & Grade)">
          <TextControl type="number" readOnly placeholder="Pilih Grade & SBU dahulu" value={price?.HargaSatuan ?? ''} />
        </FormField>
      </FormRow>
      <FormRow>
        <FormField label="PJTK"><TextControl placeholder="cth: PT ABC" {...bind('PJTK')} /></FormField>
        <FormField label="No. SP2K"><TextControl placeholder="cth: SP2K-2026-001" {...bind('NoSP2K')} /></FormField>
      </FormRow>
      <FormRow>
        <FormField label="Nama TL (Team Leader)"><TextControl placeholder="Nama Team Leader" {...bind('NamaTL')} /></FormField>
        <FormField label="Sub Bidang">
          <SelectControl placeholder="— Pilih Sub Bidang —" options={subBidangList.map(({ nama }) => nama)} {...bind('SubBidang')} />
        </FormField>
      </FormRow>
      <FormRow>
        <FormField label="BKO Jabatan" hint="ℹ️ Jika diisi, Jabatan akan otomatis mengikuti BKO Jabatan ini setelah disimpan.">
          <SelectControl placeholder="— Pilih BKO Jabatan —" options={DEFAULT_JABATAN} value={form.BKOJabatan} onChange={handleBkoJabatanChange} />
        </FormField>
        <FormField label="BKO SBU"><SelectControl placeholder="— Pilih BKO SBU —" options={DEFAULT_SBU} {...bind('BKOSBU')} /></FormField>
      </FormRow>
      <FormRow>
        <FormField label="NIP Baru"><TextControl {...bind('NIPBaru')} /></FormField>
        <FormField label="Email Pribadi"><TextControl type="email" {...bind('Email')} /></FormField>
      </FormRow>
      <FormRow>
        <FormField label="Email Korporat"><TextControl type="email" placeholder="nama@perusahaan.co.id" {...bind('EmailKorporat')} /></FormField>
        <FormField label="Nama Akun ICRM"><TextControl placeholder="Nama akun di sistem ICRM" {...bind('NamaAkunICRM')} /></FormField>
      </FormRow>
      <FormRow>
        <FormField label="Nomor Telpon Aktif">
          <TextControl
            placeholder="+62812xxxxxxx"
            value={form.NoTelp}
            onChange={(event) => setField('NoTelp', normalizePhone(event.target.value))}
          />
        </FormField>
      </FormRow>
      <FormRow>
        <FormField label="Tanggal Masuk" required><TextControl type="date" {...bind('TglMasuk')} /></FormField>
        <FormField label="Tanggal Keluar"><TextControl type="date" {...bind('TglKeluar')} /></FormField>
      </FormRow>

      <hr className="my-5 border-line" />
      <div className="mb-3 text-[13px] font-semibold uppercase tracking-[0.05em] text-fg-muted">🏷️ Status Kepegawaian</div>
      <FormRow>
        <FormField label="Status Saat Ini"><SelectControl options={EMPLOYEE_STATUS_OPTIONS} {...bind('Status')} /></FormField>
        <FormField label="Catatan Status">
          <TextControl placeholder="cth: Pindah divisi / Resign per..." {...bind('StatusCatatan')} />
        </FormField>
      </FormRow>

      <InfoNote className="mt-2.5">
        ℹ️ <strong>Tanggal Update</strong> otomatis tercatat. Setiap perubahan (Jabatan, SBU, Status) akan dicatat terpisah ke histori.
      </InfoNote>
      <InfoNote tone="success" className="mt-2">
        🔄 Karyawan berstatus <strong>Baru Masuk</strong> akan otomatis berubah menjadi <strong>Aktif</strong> setelah genap 1 bulan sejak <strong>Tanggal Masuk</strong> (dicek setiap kali aplikasi dibuka). Isi Tanggal Masuk agar fitur ini berjalan.
      </InfoNote>

      <ModalActions>
        <Button variant="secondary" onClick={() => dispatch(closeModal())}>Batal</Button>
        <Button onClick={handleSubmit}>Simpan Data</Button>
      </ModalActions>
    </Modal>
  );
}