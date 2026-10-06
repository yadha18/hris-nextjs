'use client';

import FilterBar from '@/components/ui/FilterBar';
import { STATUS_DEFINITIONS } from '@/lib/config';

export default function EmployeeFilters({ filters, options, onChange }) {
  const selects = [
    { key: 'jabatan', placeholder: 'Semua Jabatan', options: options.jabatan },
    { key: 'sbu', placeholder: 'Semua SBU', options: options.sbu },
    { key: 'grade', placeholder: 'Semua Grade', options: options.grade },
    { key: 'status', placeholder: 'Semua Status', options: Object.keys(STATUS_DEFINITIONS) },
  ].map((select) => ({ ...select, value: filters[select.key], onChange: (value) => onChange(select.key, value) }));

  return (
    <FilterBar
      searchValue={filters.searchText}
      searchPlaceholder="🔍  Cari NIP, Nama, SBU..."
      onSearchChange={(value) => onChange('searchText', value)}
      selects={selects}
    />
  );
}