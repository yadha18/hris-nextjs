"use client";

import { useDispatch, useSelector } from "react-redux";
import ActivityLogTable from "@/components/ui/ActivityLogTable";
import Button from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import StatGrid from "@/components/ui/StatGrid";
import { LAPTOP_LOG_VARIANTS, LAPTOP_TOTAL_LOCKED_VALUE } from "@/lib/config";
import { exportLaptopDashboard } from "@/lib/excel";
import { selectLaptopDashboard, selectLaptopLog } from "@/lib/selectors";
import { showToast } from "@/store/slices/uiSlice";
import LaptopSbuBreakdown from "./LaptopSbuBreakdown";

export default function LaptopDashboardPage() {
  const dispatch = useDispatch();
  const dashboard = useSelector(selectLaptopDashboard);
  const laptopLog = useSelector(selectLaptopLog);
  const { totals, sbuRows } = dashboard;

  const handleExport = async () => {
    if (!totals.total)
      return dispatch(showToast("❌ Tidak ada data untuk diexport!"));
    await exportLaptopDashboard(dashboard);
    dispatch(showToast("✅ Excel berhasil diexport!"));
  };

  return (
    <>
      <PageHeader
        title="💻 Dashboard Laptop"
        description="Ringkasan status pengadaan laptop per SBU."
      />

      <Card>
        <div className="mb-3.5 flex items-center justify-between gap-2.5">
          <CardTitle>💻 Ringkasan Status Laptop</CardTitle>
          <Button variant="success" size="sm" onClick={handleExport}>
            ⬇ Export Excel
          </Button>
        </div>
        <StatGrid desktopColumns={6}>
          <StatCard
            label="Total Laptop 🔒"
            value={LAPTOP_TOTAL_LOCKED_VALUE}
            tone="accent"
            title="Angka ini dikunci permanen, tidak dihitung otomatis dari data."
          />
          <StatCard label="🟢 Aktif" value={totals.active} tone="success" />
          <StatCard
            label="🔴 Belum Dikembalikan"
            value={totals.notReturned}
            tone="danger"
          />
          <StatCard
            label="✅ Sudah Dikembalikan"
            value={totals.returned}
            tone="warning"
          />
          <StatCard
            label="⛔ Belum Dapat Laptop"
            value={totals.missing}
            tone="muted"
          />
          <StatCard
            label="🚫 Tidak Dapat Laptop"
            value={totals.notEntitled}
            tone="muted"
          />
        </StatGrid>
      </Card>

      <Card>
        <CardTitle>📊 Rincian Status Laptop per SBU</CardTitle>
        <LaptopSbuBreakdown sbuRows={sbuRows} />
      </Card>

      <Card>
        <CardTitle>🔄 Review Log Perubahan — Monitoring Laptop</CardTitle>
        <ActivityLogTable
          entries={laptopLog}
          typePrefix="laptop"
          typeVariants={LAPTOP_LOG_VARIANTS}
          emptyDescription="Log akan muncul saat ada upload, tambah, edit, atau hapus data laptop."
        />
      </Card>
    </>
  );
}
