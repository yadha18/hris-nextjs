"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@/components/ui/Button";
import {
  CONTROL_CLASS,
  FormField,
  FormRow,
  SelectControl,
  TextControl,
} from "@/components/ui/FormField";
import InfoNote from "@/components/ui/InfoNote";
import Modal, { ModalActions } from "@/components/ui/Modal";
import { DEFAULT_SBU, LAPTOP_STATUS_OPTIONS } from "@/lib/config";
import { compressImageFile } from "@/lib/image";
import { suggestLaptopStatus } from "@/lib/laptopService";
import { findEmployeeByNip } from "@/lib/utils";
import { saveLaptopEntry } from "@/store/laptopActions";
import { closeModal, showToast } from "@/store/slices/uiSlice";

function buildInitialForm(existingEntry, prefillNip, employees) {
  if (existingEntry) {
    const { NIP, NamaPengguna, SBU, NamaPerangkat, PA, SerialNumber, Status } =
      existingEntry;
    return { NIP, NamaPengguna, SBU, NamaPerangkat, PA, SerialNumber, Status };
  }
  const holder = prefillNip ? findEmployeeByNip(employees, prefillNip) : null;
  return {
    NIP: prefillNip ?? "",
    NamaPengguna: holder?.Nama ?? "",
    SBU: holder?.SBU ?? "",
    NamaPerangkat: "",
    PA: "",
    SerialNumber: "",
    Status: "",
  };
}

export default function EditLaptopModal({ entryId, prefillNip }) {
  const dispatch = useDispatch();
  const employees = useSelector((state) => state.hris.karyawan);
  const existingEntry = useSelector((state) =>
    entryId === null
      ? null
      : state.hris.laptop.find((laptop) => laptop.id === entryId),
  );

  const [form, setForm] = useState(() =>
    buildInitialForm(existingEntry, prefillNip, employees),
  );
  const [proof, setProof] = useState({
    dataUrl: existingEntry?.BuktiBA ?? null,
    fileName: existingEntry?.BuktiBAFileName ?? null,
  });

  const setField = (field, value) =>
    setForm((previous) => ({ ...previous, [field]: value }));
  const bind = (field) => ({
    value: form[field],
    onChange: (event) => setField(field, event.target.value),
  });

  // NIP opsional: jika ditemukan di Data Karyawan, Nama Pengguna & Regional terisi otomatis (tetap bisa diubah manual)
  const handleNipChange = (event) => {
    const nip = event.target.value;
    const holder = findEmployeeByNip(employees, nip.trim());
    setForm((previous) => ({
      ...previous,
      NIP: nip,
      NamaPengguna: holder ? holder.Nama : previous.NamaPengguna,
      SBU: holder ? holder.SBU : previous.SBU,
    }));
  };

  const handleProofSelected = async (event) => {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return dispatch(showToast("❌ File harus berupa gambar!"));

    try {
      setProof({ dataUrl: await compressImageFile(file), fileName: file.name });
      dispatch(
        showToast(
          "✅ Gambar berhasil dimuat — klik Simpan untuk menyimpan data.",
        ),
      );
    } catch (error) {
      dispatch(showToast(`❌ Gagal memproses gambar: ${error.message}`));
    }
  };

  const nip = form.NIP.trim();
  const isNipUnknown = nip && !findEmployeeByNip(employees, nip);
  const suggestedStatus = suggestLaptopStatus(
    employees,
    nip,
    Boolean(proof.dataUrl),
  );
  const hasStatusMismatch = form.Status && form.Status !== suggestedStatus;

  const handleSubmit = () => {
    const requiredFields = [
      [form.NamaPengguna, "Nama Pengguna"],
      [form.SBU, "Regional/SBU"],
      [form.NamaPerangkat, "Nama Perangkat"],
      [form.SerialNumber, "Serial Number"],
    ];
    const missingField = requiredFields.find(([value]) => !value.trim());
    if (missingField)
      return dispatch(showToast(`❌ ${missingField[1]} wajib diisi!`));

    const result = dispatch(
      saveLaptopEntry({
        entryId,
        formData: {
          ...form,
          NIP: nip,
          BuktiBA: proof.dataUrl,
          BuktiBAFileName: proof.fileName,
        },
      }),
    );
    if (!result.success)
      return dispatch(showToast(`❌ ${result.errorMessage}`, 5000));

    dispatch(
      showToast(
        result.isNew
          ? "✅ Data laptop berhasil ditambahkan"
          : "✅ Data laptop berhasil diperbarui",
      ),
    );
    dispatch(closeModal());
  };

  return (
    <Modal
      title={entryId === null ? "➕ Tambah Data Laptop" : "✏️ Edit Data Laptop"}
      onClose={() => dispatch(closeModal())}
      widthClass="max-w-[560px]"
    >
      <FormRow>
        <FormField label="NIP" labelNote="(opsional)">
          <TextControl
            placeholder="ex: 123456789ICN — boleh dikosongkan"
            value={form.NIP}
            onChange={handleNipChange}
          />
        </FormField>
        <FormField label="Nama Pengguna" required>
          <TextControl
            placeholder="Otomatis kalau NIP ditemukan, atau isi manual"
            {...bind("NamaPengguna")}
          />
        </FormField>
      </FormRow>
      <FormRow>
        <FormField label="Regional / SBU" required>
          <SelectControl
            placeholder="— Pilih Regional/SBU —"
            options={DEFAULT_SBU}
            {...bind("SBU")}
          />
        </FormField>
        <FormField label="PA">
          <TextControl placeholder="cth: PA-2026-001" {...bind("PA")} />
        </FormField>
      </FormRow>

      {isNipUnknown && (
        <InfoNote>
          ℹ️ NIP tidak ditemukan di Data Karyawan — isi Nama Pengguna &amp;
          Regional secara manual.
        </InfoNote>
      )}

      <FormRow>
        <FormField label="Nama Perangkat" required>
          <TextControl
            placeholder="cth: Lenovo ThinkPad T14"
            {...bind("NamaPerangkat")}
          />
        </FormField>
        <FormField label="Serial Number" required>
          <TextControl placeholder="cth: PF3ABCDE" {...bind("SerialNumber")} />
        </FormField>
      </FormRow>

      <FormField label="Status Laptop">
        <SelectControl
          placeholder="— Belum diisi —"
          options={LAPTOP_STATUS_OPTIONS}
          {...bind("Status")}
        />
        {form.NamaPengguna.trim() && (
          <InfoNote
            tone={hasStatusMismatch ? "warning" : "info"}
            className="mt-2"
          >
            {hasStatusMismatch
              ? `⚠️ Saran berdasarkan data karyawan: "${suggestedStatus}" (status yang dipilih berbeda).`
              : `💡 Saran status: "${suggestedStatus}".`}
          </InfoNote>
        )}
      </FormField>

      <FormField label="Bukti Berita Acara Pengembalian (gambar)">
        <input
          type="file"
          accept="image/*"
          onChange={handleProofSelected}
          className={CONTROL_CLASS}
        />
        {proof.dataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={proof.dataUrl}
            alt="Pratinjau bukti"
            className="mt-2.5 max-h-40 max-w-40 rounded-lg border border-line"
          />
        )}
      </FormField>

      <ModalActions>
        <Button variant="secondary" onClick={() => dispatch(closeModal())}>
          Batal
        </Button>
        <Button onClick={handleSubmit}>Simpan Data</Button>
      </ModalActions>
    </Modal>
  );
}
