"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@/components/ui/Button";
import {
  FormField,
  FormRow,
  SelectControl,
  TextControl,
} from "@/components/ui/FormField";
import InfoNote from "@/components/ui/InfoNote";
import Modal, { ModalActions } from "@/components/ui/Modal";
import { LEMBUR_BILLING_TYPES, LEMBUR_MONTH_OPTIONS } from "@/lib/config";
import { resolveLemburIdentity } from "@/lib/lemburService";
import { parseNominal } from "@/lib/utils";
import { saveLemburEntry } from "@/store/lemburActions";
import { closeModal, showToast } from "@/store/slices/uiSlice";

const IDENTITY_FIELDS = [
  ["Nama (otomatis)", "Nama"],
  ["SBU (otomatis)", "SBU"],
  ["Jabatan (otomatis)", "Jabatan"],
];

export default function EditLemburModal({ entryId }) {
  const dispatch = useDispatch();
  const employees = useSelector((state) => state.hris.karyawan);
  const selectedMonth = useSelector((state) => state.ui.selectedBulan);
  const existingEntry = useSelector((state) =>
    entryId === null
      ? null
      : state.hris.lembur.find((entry) => entry.id === entryId),
  );

  const [form, setForm] = useState(() => ({
    NIP: existingEntry?.NIP ?? "",
    Nominal: existingEntry?.Nominal ?? "",
    Bulan: existingEntry?.Bulan ?? (selectedMonth || LEMBUR_MONTH_OPTIONS[0]),
    Tagihan: existingEntry?.Tagihan ?? LEMBUR_BILLING_TYPES[0],
  }));
  const bind = (field) => ({
    value: form[field],
    onChange: (event) =>
      setForm((previous) => ({ ...previous, [field]: event.target.value })),
  });

  const identity = resolveLemburIdentity(employees, form.NIP, existingEntry);
  const isNipUnknown = form.NIP.trim() && identity.source === "none";

  const handleSubmit = () => {
    const nominal = parseNominal(form.Nominal);
    if (!form.NIP.trim()) return dispatch(showToast("❌ NIP wajib diisi!"));
    if (nominal <= 0)
      return dispatch(showToast("❌ Nominal harus lebih dari 0!"));

    const result = dispatch(
      saveLemburEntry({
        entryId,
        formData: {
          NIP: form.NIP.trim(),
          Nominal: nominal,
          Bulan: form.Bulan,
          Tagihan: form.Tagihan,
        },
      }),
    );
    if (!result.success) return dispatch(showToast("❌ Data tidak ditemukan."));

    dispatch(
      showToast(
        result.isNew
          ? "✅ Data berhasil ditambahkan"
          : "✅ Data berhasil diperbarui",
      ),
    );
    dispatch(closeModal());
  };

  return (
    <Modal
      title={
        entryId === null
          ? "➕ Tambah Data Lembur/SPPD"
          : "✏️ Edit Data Lembur/SPPD"
      }
      onClose={() => dispatch(closeModal())}
    >
      <FormRow>
        <FormField label="NIP" required>
          <TextControl placeholder="ex: 123456789ICN" {...bind("NIP")} />
        </FormField>
        <FormField label={IDENTITY_FIELDS[0][0]}>
          <TextControl disabled value={identity.Nama} />
        </FormField>
      </FormRow>
      <FormRow>
        <FormField label={IDENTITY_FIELDS[1][0]}>
          <TextControl disabled value={identity.SBU} />
        </FormField>
        <FormField label={IDENTITY_FIELDS[2][0]}>
          <TextControl disabled value={identity.Jabatan} />
        </FormField>
      </FormRow>

      {identity.source === "archive" && (
        <InfoNote tone="warning">
          📌 Karyawan ini sudah tidak ada di Data Karyawan (resign/dihapus).
          Nama/SBU/Jabatan yang ditampilkan adalah data arsip — tetap tersimpan
          &amp; tetap dihitung di Realisasi.
        </InfoNote>
      )}
      {isNipUnknown && (
        <InfoNote tone="danger">
          ⚠️ NIP tidak ditemukan di Data Karyawan. Nama/SBU/Jabatan akan
          dikosongkan.
        </InfoNote>
      )}

      <FormRow>
        <FormField label="Nominal" required>
          <TextControl
            type="number"
            min="0"
            placeholder="cth: 500000"
            {...bind("Nominal")}
          />
        </FormField>
        <FormField label="Bulan" required>
          <SelectControl options={LEMBUR_MONTH_OPTIONS} {...bind("Bulan")} />
        </FormField>
      </FormRow>
      <FormRow>
        <FormField label="Tagihan" required>
          <SelectControl options={LEMBUR_BILLING_TYPES} {...bind("Tagihan")} />
        </FormField>
      </FormRow>

      <ModalActions>
        <Button variant="secondary" onClick={() => dispatch(closeModal())}>
          Batal
        </Button>
        <Button onClick={handleSubmit}>Simpan Data</Button>
      </ModalActions>
    </Modal>
  );
}
