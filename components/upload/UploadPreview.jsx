'use client';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Button from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import DataTable, { Td } from '@/components/ui/DataTable';
import InfoNote from '@/components/ui/InfoNote';
import Pill from '@/components/ui/Pill';
import StatCard from '@/components/ui/StatCard';
import StatGrid from '@/components/ui/StatGrid';
import { UPLOAD_TYPES } from '@/lib/upload/uploadRegistry';
import { UPLOAD_TYPE_CONTENT } from './uploadTypeContent';

const MAX_PREVIEW_ROWS = 50;
const WIDE_TABLE_COLUMN_THRESHOLD = 8;

export default function UploadPreview({ uploadType, rows, onCancel, onConfirm }) {
  const typeConfig = UPLOAD_TYPES[uploadType];
  const hrisState = useSelector((state) => state.hris);

  const classifiedRows = useMemo(() => typeConfig.classifyRows(rows, hrisState), [typeConfig, rows, hrisState]);
  const previewColumns = typeConfig.columns.filter((column) => !column.isHiddenInPreview);
  const hiddenRowCount = Math.max(0, classifiedRows.length - MAX_PREVIEW_ROWS);

  const summaryCards = typeConfig.summaryCards.map((card) => ({
    ...card,
    count: classifiedRows.filter((row) => card.statuses.includes(row.uploadStatus)).length,
  }));

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
        <CardTitle>👁 Preview Data</CardTitle>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="secondary" onClick={onCancel}>✕ Batal</Button>
          <Button onClick={onConfirm}>✔ Konfirmasi &amp; Simpan</Button>
        </div>
      </div>

      <StatGrid desktopColumns={summaryCards.length}>
        {summaryCards.map(({ label, tone, count }) => (
          <StatCard key={label} label={label} value={count} tone={tone} />
        ))}
      </StatGrid>
      <InfoNote>{UPLOAD_TYPE_CONTENT[uploadType].previewNote}</InfoNote>

      <DataTable
        headers={['Status', ...previewColumns.map(({ header }) => header)]}
        minWidthClass={previewColumns.length > WIDE_TABLE_COLUMN_THRESHOLD ? 'min-w-[1200px]' : ''}
      >
        {classifiedRows.slice(0, MAX_PREVIEW_ROWS).map((row, rowIndex) => {
          const rowStatus = typeConfig.rowStatuses[row.uploadStatus];
          return (
            <tr key={rowIndex} className={rowStatus.isSkipped ? 'opacity-50' : ''}>
              <Td><Pill variant={rowStatus.variant}>{rowStatus.label}</Pill></Td>
              {previewColumns.map(({ field, isMono, formatPreview }) => (
                <Td key={field} className={isMono ? 'font-mono text-xs' : ''}>
                  {formatPreview ? formatPreview(row[field]) : row[field]}
                </Td>
              ))}
            </tr>
          );
        })}
        {hiddenRowCount > 0 && (
          <tr>
            <td colSpan={previewColumns.length + 1} className="px-3.5 py-2.5 text-center text-fg-muted">
              ... dan {hiddenRowCount} baris lainnya
            </td>
          </tr>
        )}
      </DataTable>
    </Card>
  );
}