'use client';

import { useMemo } from 'react';
import usePagination from '@/hooks/usePagination';
import DataTable, { Td } from './DataTable';
import EmptyState from './EmptyState';
import PaginationBar from './PaginationBar';
import Pill from './Pill';

export default function ActivityLogTable({ entries, typePrefix, typeVariants, identityHeader = 'NIP', emptyDescription }) {
  const newestFirstEntries = useMemo(() => [...entries].reverse(), [entries]);
  const { currentPage, pageSize, visibleItems, setPage, changePageSize } = usePagination(newestFirstEntries);

  if (!entries.length) return <EmptyState icon="📋" title="Belum ada perubahan" description={emptyDescription} />;

  return (
    <>
      <DataTable headers={['Tanggal', identityHeader, 'Nama', 'Tipe', 'Detail Perubahan']} minWidthClass="min-w-[900px]">
        {visibleItems.map((entry) => (
          <tr key={entry.id} className="hover:bg-white/[0.02]">
            <Td className="text-[11px] text-fg-muted">{entry.ts}</Td>
            <Td className="font-mono text-xs">{entry.nik}</Td>
            <Td className="font-medium">{entry.nama}</Td>
            <Td>
              <Pill variant={typeVariants[entry.type] ?? 'gray'}>
                {entry.type.replace(`${typePrefix} `, '').toUpperCase()}
              </Pill>
            </Td>
            <Td className="text-xs">
              <span className="text-[11px] text-danger line-through">{entry.oldVal}</span>
              <br />
              <span className="font-semibold text-success">{entry.newVal}</span>
              {entry.catatan && (
                <>
                  <br />
                  <span className="text-[10px] text-fg-muted">{entry.catatan}</span>
                </>
              )}
            </Td>
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