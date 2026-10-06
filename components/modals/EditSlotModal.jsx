'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@/components/ui/Button';
import { FormField, SelectControl, TextControl } from '@/components/ui/FormField';
import InfoNote from '@/components/ui/InfoNote';
import Modal, { ModalActions } from '@/components/ui/Modal';
import { saveSlotConfig } from '@/store/hrisActions';
import { closeModal, showToast } from '@/store/slices/uiSlice';

const toSlotCount = (rawValue) => Math.max(0, parseInt(rawValue, 10) || 0);

export default function EditSlotModal({ sbuName }) {
  const dispatch = useDispatch();
  const savedSlots = useSelector((state) => state.hris.slotConfig[sbuName]?.jabatan);
  const jabatanList = useSelector((state) => state.hris.jabatan);

  // Perubahan ditahan di draft lokal dan baru masuk ke store saat "Simpan"
  const [draftSlots, setDraftSlots] = useState(() => ({ ...savedSlots }));
  const [jabatanToAdd, setJabatanToAdd] = useState('');

  if (!savedSlots) return null;

  const totalDraftSlots = Object.values(draftSlots).reduce((sum, slotCount) => sum + (Number(slotCount) || 0), 0);
  const addableJabatan = jabatanList.map(({ nama }) => nama).filter((nama) => !(nama in draftSlots));

  const setSlotCount = (jabatanName, rawValue) => setDraftSlots((previous) => ({ ...previous, [jabatanName]: rawValue }));
  const removeJabatan = (jabatanName) =>
    setDraftSlots((previous) => Object.fromEntries(Object.entries(previous).filter(([name]) => name !== jabatanName)));
  const addJabatan = () => {
    if (!jabatanToAdd) return dispatch(showToast('❌ Pilih jabatan terlebih dahulu!'));
    setDraftSlots((previous) => ({ ...previous, [jabatanToAdd]: 0 }));
    setJabatanToAdd('');
  };

  const handleSave = () => {
    const jabatanSlots = Object.fromEntries(Object.entries(draftSlots).map(([name, value]) => [name, toSlotCount(value)]));
    const { hasChanges } = dispatch(saveSlotConfig({ sbuName, jabatanSlots }));
    dispatch(closeModal());
    dispatch(showToast(hasChanges ? `✅ Slot fix "${sbuName}" berhasil diperbarui` : 'ℹ️ Tidak ada perubahan'));
  };

  return (
    <Modal
      title={<>✏️ Edit Slot Fix — <span className="text-accent-light">{sbuName}</span></>}
      onClose={() => dispatch(closeModal())}
      widthClass="max-w-[560px]"
    >
      <InfoNote>ℹ️ Perubahan akan tercatat di Review Log Perubahan dan berlaku untuk semua pengguna.</InfoNote>

      <div className="mb-4 flex flex-col gap-2">
        {Object.entries(draftSlots).map(([jabatanName, slotCount]) => (
          <div key={jabatanName} className="flex items-center gap-2.5 rounded-lg border border-line bg-surface2 px-2.5 py-2">
            <span className="flex-1 text-[13px]">{jabatanName}</span>
            <TextControl
              type="number"
              min="0"
              value={slotCount}
              onChange={(event) => setSlotCount(jabatanName, event.target.value)}
              className="w-20 shrink-0 text-center"
            />
            <Button variant="danger" size="sm" onClick={() => removeJabatan(jabatanName)}>✕</Button>
          </div>
        ))}
      </div>

      <hr className="my-5 border-line" />

      <div className="flex items-end gap-2.5">
        <FormField label="Tambah Jabatan Baru ke SBU Ini" className="mb-0">
          <SelectControl
            placeholder="— Pilih Jabatan untuk Ditambahkan —"
            options={addableJabatan}
            value={jabatanToAdd}
            onChange={(event) => setJabatanToAdd(event.target.value)}
          />
        </FormField>
        <Button variant="secondary" className="shrink-0" onClick={addJabatan}>➕ Tambah</Button>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-line-strong bg-surface2 p-3.5">
        <span className="text-[13px] text-fg-muted">Total Slot Fix SBU Ini</span>
        <span className="font-mono text-lg font-bold text-purple">{totalDraftSlots}</span>
      </div>

      <ModalActions>
        <Button variant="secondary" onClick={() => dispatch(closeModal())}>Batal</Button>
        <Button onClick={handleSave}>💾 Simpan Perubahan</Button>
      </ModalActions>
    </Modal>
  );
}