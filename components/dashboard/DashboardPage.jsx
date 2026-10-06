'use client';

import { useSelector } from 'react-redux';
import { Card, CardTitle } from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import { selectSlotSummary } from '@/lib/selectors';
import ChangeLogTable from './ChangeLogTable';
import DashboardSkeleton from './DashboardSkeleton';
import DashboardStats from './DashboardStats';
import EmployeeTypeChart from './EmployeeTypeChart';
import SlotJabatanAccordion from './SlotJabatanAccordion';
import Button from '../ui/Button';

export default function DashboardPage() {
  const loadStatus = useSelector((state) => state.hris.loadStatus);
  const { totalFixedSlots } = useSelector(selectSlotSummary);
  const isLoading = loadStatus === 'idle' || loadStatus === 'loading';

  return (
    <>
      <PageHeader title="Dashboard Karyawan" description="Ringkasan data karyawan, status, dan perubahan historis." />

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <DashboardStats />
          <Card>
            <CardTitle>📊 Tipe Karyawan — Bulan Berjalan</CardTitle>
            <EmployeeTypeChart />
          </Card>
          <Card>
            <CardTitle>📌 Slot Jabatan per SBU (Fix: {totalFixedSlots} Total)</CardTitle>
            <SlotJabatanAccordion />
          </Card>
          <Card>
            <ChangeLogTable />
          </Card>
          <div className="flex justify-end">
            <Button variant="success" onClick={() => exportEmployees({ includeLog: true })}>⬇ Export Excel Terbaru</Button>
          </div>
        </>
      )}
    </>
  );
}