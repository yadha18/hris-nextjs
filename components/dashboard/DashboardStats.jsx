'use client';

import { useDispatch, useSelector } from 'react-redux';
import StatCard from '@/components/ui/StatCard';
import StatGrid from '@/components/ui/StatGrid';
import { selectEmployeeChangeLog, selectEmployeeStatusCounts, selectSlotSummary } from '@/lib/selectors';
import { openModal } from '@/store/slices/uiSlice';

const LIST_HINT = 'Klik untuk lihat daftar karyawan';

export default function DashboardStats() {
  const dispatch = useDispatch();
  const { newHireCount, activeCount, resignedCount } = useSelector(selectEmployeeStatusCounts);
  const changeLogCount = useSelector(selectEmployeeChangeLog).length;
  const jabatanCount = useSelector((state) => state.hris.jabatan.length);
  const { totalFixedSlots, occupiedSlots, remainingSlots } = useSelector(selectSlotSummary);

  const openStatusList = (status) => dispatch(openModal({ name: 'statusList', payload: status }));

  return (
    <>
      <StatGrid desktopColumns={5}>
        <StatCard label="🟢 Karyawan Baru" value={newHireCount} tone="success" title={LIST_HINT} onClick={() => openStatusList('Baru Masuk')} />
        <StatCard label="🔵 Aktif" value={activeCount} tone="accent" title={LIST_HINT} onClick={() => openStatusList('Aktif')} />
        <StatCard label="🔴 Resign" value={resignedCount} tone="danger" title={LIST_HINT} onClick={() => openStatusList('Resign')} />
        <StatCard label="Data Diubah" value={changeLogCount} tone="warning" />
      </StatGrid>

      <StatGrid desktopColumns={4}>
        <StatCard label="📋 Total Jabatan Tersedia" value={jabatanCount} />
        <StatCard label="📌 Total Slot Fix" value={totalFixedSlots} tone="purple" />
        <StatCard label="✅ Slot Terisi" value={occupiedSlots} tone="accent" />
        <StatCard label="🟡 Slot Tersisa" value={remainingSlots} tone="warning" />
      </StatGrid>
    </>
  );
}