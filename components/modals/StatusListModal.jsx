'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@/components/ui/Button';
import DataTable, { Td } from '@/components/ui/DataTable';
import { TextControl } from '@/components/ui/FormField';
import Modal, { ModalActions } from '@/components/ui/Modal';
import Pill from '@/components/ui/Pill';
import { closeModal, openModal } from '@/store/slices/uiSlice';

const MODAL_TITLES = {
  'Baru Masuk': '🟢 Daftar Karyawan Baru',
  Aktif: '🔵 Daftar Karyawan Aktif',
  Resign: '🔴 Daftar Karyawan Resign',
};
const TABLE_HEADERS = ['NIP', 'Nama', 'Jabatan', 'SBU', 'Tgl Masuk'];

export default function StatusListModal({ status }) {
  const dispatch = useDispatch();
  const employees = useSelector((state) => state.hris.karyawan);
  const [searchText, setSearchText] = useState('');

  const query = searchText.toLowerCase();
  const matchingEmployees = employees.filter(
    (employee) =>
      employee.Status === status &&
      (!query || [employee.NIP, employee.Nama, employee.SBU].some((field) => field.toLowerCase().includes(query)))
  );

  return (
    <Modal title={MODAL_TITLES[status] ?? 'Daftar Karyawan'} onClose={() => dispatch(closeModal())} widthClass="max-w-[720px]">
      <TextControl
        placeholder="🔍 Cari NIP, Nama, SBU..."
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
        className="mb-3.5"
      />
      <div className="max-h-[420px] overflow-y-auto">
        <DataTable headers={TABLE_HEADERS}>
          {matchingEmployees.map((employee) => (
            <tr
              key={employee.id}
              className="cursor-pointer hover:bg-white/[0.03]"
              title="Lihat detail karyawan"
              onClick={() => dispatch(openModal({ name: 'employeeDetail', payload: employee.id }))}
            >
              <Td className="font-mono text-xs">{employee.NIP}</Td>
              <Td className="font-medium text-accent-light">{employee.Nama}</Td>
              <Td><Pill variant="blue">{employee.Jabatan}</Pill></Td>
              <Td>{employee.SBU}</Td>
              <Td className="text-xs text-fg-muted">{employee.TglMasuk || '—'}</Td>
            </tr>
          ))}
        </DataTable>
        {!matchingEmployees.length && <div className="py-10 text-center text-[15px] text-fg-muted">Tidak ada data</div>}
      </div>
      <ModalActions>
        <Button variant="secondary" onClick={() => dispatch(closeModal())}>Tutup</Button>
      </ModalActions>
    </Modal>
  );
}