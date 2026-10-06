'use client';

import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Button from '@/components/ui/Button';
import DataTable, { Td } from '@/components/ui/DataTable';
import EmptyState from '@/components/ui/EmptyState';
import PaginationBar from '@/components/ui/PaginationBar';
import Pill from '@/components/ui/Pill';
import StatusPill from '@/components/ui/StatusPill';
import { selectEmployeeChangeLog } from '@/lib/selectors';
import usePagination from '@/hooks/usePagination';

const INITIAL_FILTERS = { searchText: '', type: '', dateFrom: '', dateTo: '' };
const DEFAULT_PAGE_SIZE = 10;
const LOG_TABLE_HEADERS = ['Tanggal', 'NIP', 'Nama', 'Tipe Perubahan', 'Detail Perubahan'];
const TYPE_BADGE_VARIANTS = { status: 'purple', sbu: 'blue', 'bko jabatan': 'green', 'bko sbu': 'purple' };
const CONTROL_CLASS =
  'w-full rounded-lg border border-line-strong bg-surface2 px-3 py-[9px] text-[13px] text-fg outline-none transition focus:border-accent';

function filterChangeLog(entries, { searchText, type, dateFrom, dateTo }) {
  const query = searchText.toLowerCase();
  return entries.filter((entry) => {
    const matchesSearch =
      !query ||
      [entry.nik, entry.nama, entry.type, entry.oldVal, entry.newVal].some((field) =>
        String(field).toLowerCase().includes(query)
      );
    // entry.ts berformat YYYY-MM-DD, aman dibandingkan sebagai string
    return matchesSearch && (!type || entry.type === type) && (!dateFrom || entry.ts >= dateFrom) && (!dateTo || entry.ts <= dateTo);
  });
}

function ChangeDetail({ entry }) {
  if (entry.type === 'status') {
    return (
      <>
        <StatusPill status={entry.oldVal} /> → <StatusPill status={entry.newVal} />
        {entry.catatan && (
          <>
            <br />
            <span className="text-[10px] text-fg-muted">{entry.catatan}</span>
          </>
        )}
      </>
    );
  }
  return (
    <>
      <span className="text-[11px] text-danger line-through">{entry.oldVal}</span>
      <br />
      <span className="font-semibold text-success">{entry.newVal}</span>
    </>
  );
}

export default function ChangeLogTable() {
  const changeLog = useSelector(selectEmployeeChangeLog);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const typeOptions = useMemo(() => [...new Set(changeLog.map((entry) => entry.type))].sort(), [changeLog]);
  const newestFirstEntries = useMemo(() => filterChangeLog(changeLog, filters).reverse(), [changeLog, filters]);

  const { currentPage, pageSize, visibleItems: visibleEntries, setPage, changePageSize, goToFirstPage } =
  usePagination(newestFirstEntries);

  const updateFilter = (filterName, value) => {
    setFilters((previous) => ({ ...previous, [filterName]: value }));
    goToFirstPage(1);
  };
  const clearDateFilter = () => {
    setFilters((previous) => ({ ...previous, dateFrom: '', dateTo: '' }));
    goToFirstPage(1);
  };

  let tableContent;
  if (!changeLog.length) {
    tableContent = <EmptyState icon="📋" title="Belum ada perubahan" description="Log akan muncul saat ada perubahan data." />;
  } else if (!newestFirstEntries.length) {
    tableContent = <EmptyState icon="🔍" title="Tidak ada log yang cocok" />;
  } else {
    tableContent = (
      <>
        <DataTable headers={LOG_TABLE_HEADERS} minWidthClass="min-w-[1200px]">
          {visibleEntries.map((entry) => (
            <tr key={entry.id} className="hover:bg-white/[0.02]">
              <Td className="text-[11px] text-fg-muted">{entry.ts}</Td>
              <Td className="font-mono text-xs">{entry.nik}</Td>
              <Td className="font-medium">{entry.nama}</Td>
              <Td><Pill variant={TYPE_BADGE_VARIANTS[entry.type] ?? 'yellow'}>{entry.type.toUpperCase()}</Pill></Td>
              <Td className="text-xs"><ChangeDetail entry={entry} /></Td>
            </tr>
          ))}
        </DataTable>
        <PaginationBar
          page={currentPage}
          pageSize={pageSize}
          totalItems={newestFirstEntries.length}
          itemLabel="log"
          onPageChange={setPage}
          onPageSizeChange={changePageSize}
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-2.5 md:flex-row md:flex-wrap md:items-center md:justify-between">
        <div className="text-[13px] font-semibold uppercase tracking-[0.05em] text-fg-muted">🔄 Review Log Perubahan</div>
        <div className="flex flex-wrap items-center gap-2.5">
          <select value={filters.type} onChange={(event) => updateFilter('type', event.target.value)} className={`${CONTROL_CLASS} md:max-w-[180px]`}>
            <option value="">Semua Tipe</option>
            {typeOptions.map((type) => (
              <option key={type} value={type}>{type.toUpperCase()}</option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            <input type="date" title="Dari tanggal" value={filters.dateFrom} onChange={(event) => updateFilter('dateFrom', event.target.value)} className={`${CONTROL_CLASS} md:max-w-[150px]`} />
            <span className="text-xs text-fg-muted">s/d</span>
            <input type="date" title="Sampai tanggal" value={filters.dateTo} onChange={(event) => updateFilter('dateTo', event.target.value)} className={`${CONTROL_CLASS} md:max-w-[150px]`} />
            <Button variant="secondary" size="sm" title="Bersihkan filter tanggal" onClick={clearDateFilter}>✕</Button>
          </div>
          <input
            type="text"
            placeholder="🔍 Cari log (NIP, Nama, Tipe)..."
            value={filters.searchText}
            onChange={(event) => updateFilter('searchText', event.target.value)}
            className={`${CONTROL_CLASS} md:max-w-[250px]`}
          />
        </div>
      </div>
      {tableContent}
    </>
  );
}