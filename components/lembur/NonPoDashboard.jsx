"use client";

import { useDispatch, useSelector } from "react-redux";
import ActivityLogTable from "@/components/ui/ActivityLogTable";
import Button from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import CurrencyInput from "@/components/ui/CurrencyInput";
import DataTable, { Td } from "@/components/ui/DataTable";
import StatCard from "@/components/ui/StatCard";
import StatGrid from "@/components/ui/StatGrid";
import { LEMBUR_LOG_VARIANTS } from "@/lib/config";
import { exportNonPoDashboard } from "@/lib/excel";
import { selectLemburLog, selectNonPoDashboard } from "@/lib/selectors";
import { formatRupiah } from "@/lib/utils";
import { updateLemburSbuConfig } from "@/store/lemburActions";
import { showToast } from "@/store/slices/uiSlice";

const MONEY_CELL = "font-mono text-xs";
const COUNT_CELL = "text-center font-mono text-xs";
const formatPercent = (value) => `${value.toFixed(1)}%`;

const NON_PO_COLUMNS = [
  { label: "SBU", cellClass: "font-medium", render: (row) => row.sbuName },
  {
    label: "PAGU Non PO (Tahunan)",
    render: (row, { saveConfig }) => (
      <CurrencyInput
        key={`pagu-${row.annualPaguNonPo}`}
        value={row.annualPaguNonPo}
        onCommit={(value) => saveConfig(row.sbuName, "paguNonPO", value)}
      />
    ),
  },
  {
    label: "PAGU/Unit sblm Man Fee",
    cellClass: MONEY_CELL,
    render: (row) => formatRupiah(row.paguPerUnit),
  },
  {
    label: "BNLP (Tahunan)",
    render: (row, { saveConfig }) => (
      <CurrencyInput
        key={`bnlp-${row.annualBnlp}`}
        value={row.annualBnlp}
        onCommit={(value) => saveConfig(row.sbuName, "bnlp", value)}
      />
    ),
  },
  {
    label: "BNLP/Bulan",
    cellClass: MONEY_CELL,
    render: (row) => formatRupiah(row.bnlpPerMonth),
  },
  {
    label: "Max Topup/Bulan",
    cellClass: MONEY_CELL,
    render: (row) => formatRupiah(row.maxTopupPerMonth),
  },
  {
    label: "Jml Karyawan SPPD",
    align: "center",
    cellClass: COUNT_CELL,
    render: (row) => row.sppdCount,
  },
  {
    label: "Jml Karyawan Lembur",
    align: "center",
    cellClass: COUNT_CELL,
    render: (row) => row.lemburCount,
  },
  {
    label: "Total Pengajuan",
    align: "center",
    cellClass: `${COUNT_CELL} font-semibold`,
    render: (row) => row.totalSubmissions,
  },
  {
    label: "Realisasi SPPD 1 2",
    cellClass: MONEY_CELL,
    render: (row) => formatRupiah(row.sppdRealization),
  },
  {
    label: "Realisasi Lembur",
    cellClass: MONEY_CELL,
    render: (row) => formatRupiah(row.lemburRealization),
  },
  {
    label: "Realisasi SPPD/Lembur",
    cellClass: `${MONEY_CELL} font-semibold`,
    render: (row) => formatRupiah(row.totalRealization),
  },
  {
    label: "Realisasi/Max Topup",
    cellClass: MONEY_CELL,
    render: (row) => formatPercent(row.realizationVsMaxTopupPercent),
  },
  {
    label: "PAGU/Bulan",
    cellClass: MONEY_CELL,
    render: (row) => formatRupiah(row.monthlyPagu),
  },
  {
    label: "Persentase",
    cellClass: `${MONEY_CELL} font-bold`,
    render: (row) => formatPercent(row.percentage),
  },
];

const TABLE_HEADERS = NON_PO_COLUMNS.map(({ label, align }) => ({
  label,
  align,
}));

export default function NonPoDashboard() {
  const dispatch = useDispatch();
  const selectedMonth = useSelector((state) => state.ui.selectedBulan);
  const dashboard = useSelector(selectNonPoDashboard);
  const lemburLog = useSelector(selectLemburLog);

  const saveConfig = (sbuName, field, value) =>
    dispatch(updateLemburSbuConfig({ sbuName, field, value }));

  const handleExport = async () => {
    await exportNonPoDashboard({ dashboard, monthLabel: selectedMonth });
    dispatch(showToast("✅ Excel berhasil diexport!"));
  };

  return (
    <>
      <Card>
        <div className="mb-3.5 flex items-center justify-between gap-2.5">
          <CardTitle>💰 Ringkasan Realisasi</CardTitle>
          <Button variant="success" size="sm" onClick={handleExport}>
            ⬇ Export Excel
          </Button>
        </div>
        <StatGrid desktopColumns={3}>
          <StatCard
            label="Total Realisasi SPPD/Lembur"
            value={formatRupiah(dashboard.totalRealization)}
            tone="accent"
          />
          <StatCard
            label="Man Fee (7%)"
            value={formatRupiah(dashboard.manFee)}
            tone="warning"
          />
          <StatCard
            label="Grand Total"
            value={formatRupiah(dashboard.grandTotal)}
            tone="success"
          />
        </StatGrid>
      </Card>

      <Card>
        <CardTitle>📊 Rincian PAGU &amp; Realisasi per SBU</CardTitle>
        <p className="mb-3 text-xs text-fg-muted">
          ℹ️ Kolom <strong>PAGU Non PO</strong> dan <strong>BNLP</strong> diisi
          manual (nilai tahunan) — kolom lainnya dihitung otomatis.
        </p>
        <DataTable headers={TABLE_HEADERS} minWidthClass="min-w-[1700px]">
          {dashboard.rows.map((row) => (
            <tr key={row.sbuName} className="hover:bg-white/[0.02]">
              {NON_PO_COLUMNS.map(({ label, cellClass = "", render }) => (
                <Td key={label} className={cellClass}>
                  {render(row, { saveConfig })}
                </Td>
              ))}
            </tr>
          ))}
        </DataTable>
      </Card>

      <Card>
        <CardTitle>🔄 Review Log Perubahan — Data Lembur &amp; SPPD</CardTitle>
        <ActivityLogTable
          entries={lemburLog}
          typePrefix="lembur"
          typeVariants={LEMBUR_LOG_VARIANTS}
          identityHeader="NIP / SBU"
          emptyDescription="Log akan muncul saat ada upload, hapus, atau perubahan konfigurasi data lembur/SPPD."
        />
      </Card>
    </>
  );
}
