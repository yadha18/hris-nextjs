"use client";

import { useDispatch, useSelector } from "react-redux";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import { setLemburViewTab } from "@/store/slices/uiSlice";
import LemburTableView from "./LemburTableView";
import NonPoDashboard from "./NonPoDashboard";

const VIEW_TABS = [
  { key: "dashboard", label: "📈 Dashboard Non PO", Component: NonPoDashboard },
  { key: "table", label: "🧾 Tabel Data", Component: LemburTableView },
];

export default function LemburBulanPage() {
  const dispatch = useDispatch();
  const selectedMonth = useSelector((state) => state.ui.selectedBulan);
  const activeTabKey = useSelector((state) => state.ui.lemburViewTab);

  const { Component: ActiveView } =
    VIEW_TABS.find(({ key }) => key === activeTabKey) ?? VIEW_TABS[0];

  return (
    <>
      <PageHeader
        title={`📅 Data Lembur & SPPD — ${selectedMonth}`}
        description="Breakdown per bulan — pilih bulan lain lewat menu tahun di samping."
      />
      <div className="mb-4 flex gap-2.5">
        {VIEW_TABS.map(({ key, label }) => (
          <Button
            key={key}
            variant={key === activeTabKey ? "primary" : "secondary"}
            onClick={() => dispatch(setLemburViewTab(key))}
          >
            {label}
          </Button>
        ))}
      </div>
      {/* key = bulan, supaya filter & halaman tabel kembali ke awal saat pindah bulan */}
      <ActiveView key={selectedMonth} />
    </>
  );
}
