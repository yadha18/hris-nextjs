'use client';

import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import PaginationBar from '@/components/ui/PaginationBar';
import { findNewNipCandidates } from '@/lib/employeeService';
import { sortGradeList } from '@/lib/utils';
import { openModal, showToast } from '@/store/slices/uiSlice';
import EmployeeExportPanel from './EmployeeExportPanel';
import EmployeeFilters from './EmployeeFilters';
import EmployeeTable from './EmployeeTable';
import usePagination from '@/hooks/usePagination';

const INITIAL_FILTERS = { searchText: '', jabatan: '', sbu: '', grade: '', status: '' };
const DEFAULT_PAGE_SIZE = 10;

const uniqueValues = (employees, fieldName) => [...new Set(employees.map((employee) => employee[fieldName]))].filter(Boolean);

function filterEmployees(employees, { searchText, jabatan, sbu, grade, status }) {
  const query = searchText.toLowerCase();
  return employees.filter(
    (employee) =>
      (!query || [employee.NIP, employee.Nama, employee.SBU].some((field) => field.toLowerCase().includes(query))) &&
      (!jabatan || employee.Jabatan === jabatan) &&
      (!sbu || employee.SBU === sbu) &&
      (!grade || employee.Grade === grade) &&
      (!status || employee.Status === status)
  );
}

export default function KaryawanPage() {
  const dispatch = useDispatch();
  const employees = useSelector((state) => state.hris.karyawan);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const filterOptions = useMemo(
    () => ({
      jabatan: uniqueValues(employees, 'Jabatan'),
      sbu: uniqueValues(employees, 'SBU'),
      grade: sortGradeList(uniqueValues(employees, 'Grade')),
    }),
    [employees]
  );
  const filteredEmployees = useMemo(() => filterEmployees(employees, filters), [employees, filters]);

  const { currentPage, pageSize, visibleItems: visibleEmployees, setPage, changePageSize, goToFirstPage } =
  usePagination(filteredEmployees);

  const updateFilter = (filterName, value) => {
    setFilters((previous) => ({ ...previous, [filterName]: value }));
    goToFirstPage();
  };

  const handleCheckNewNip = () => {
    const { applicable, conflicts } = findNewNipCandidates(employees);
    if (!applicable.length && !conflicts.length) {
      dispatch(showToast('ℹ️ Tidak ada karyawan dengan NIP Baru yang perlu diperbarui.'));
    } else if (!applicable.length) {
      dispatch(showToast(`⚠️ ${conflicts.length} data NIP Baru bentrok dengan NIP karyawan lain — tidak ada yang bisa diperbarui.`, 6000));
    } else {
      dispatch(openModal({ name: 'checkNewNip' }));
    }
  };

  const handleDeleteAll = () => {
    if (!employees.length) return dispatch(showToast('ℹ️ Tidak ada data karyawan untuk dihapus.'));
    dispatch(openModal({ name: 'deleteAllEmployees' }));
  };

  return (
    <>
      <PageHeader
        title="Tabel Data Karyawan"
        description="Semua data detail karyawan. Anda dapat mengedit seluruh data & status secara manual."
        actions={
          <>
            <Button variant="danger" onClick={handleDeleteAll}>🗑 Hapus Semua</Button>
            <Button variant="secondary" onClick={handleCheckNewNip}>🔁 Cek NIP Baru</Button>
            <Button onClick={() => dispatch(openModal({ name: 'editEmployee', payload: null }))}>➕ Tambah Karyawan Manual</Button>
          </>
        }
      />

      <EmployeeFilters filters={filters} options={filterOptions} onChange={updateFilter} />
      <EmployeeExportPanel />

      {filteredEmployees.length ? (
        <>
          <EmployeeTable employees={visibleEmployees} />
          <PaginationBar
            page={currentPage}
            pageSize={pageSize}
            totalItems={filteredEmployees.length}
            itemLabel="data"
            onPageChange={setPage}
            onPageSizeChange={changePageSize}
          />
        </>
      ) : (
        <EmptyState icon="👥" title="Tidak ada data" />
      )}
    </>
  );
}