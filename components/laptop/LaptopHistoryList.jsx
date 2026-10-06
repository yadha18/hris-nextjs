"use client";

import { useSelector } from "react-redux";
import Pill from "@/components/ui/Pill";
import { LAPTOP_STATUS_VARIANTS } from "@/lib/config";
import { findLaptopsByNip } from "@/lib/laptopService";
import ProofThumbnail from "./ProofThumbnail";

export default function LaptopHistoryList({ nip }) {
  const laptops = useSelector((state) =>
    findLaptopsByNip(state.hris.laptop, nip),
  );

  if (!laptops.length) {
    return (
      <div className="py-6 text-center text-fg-subtle">
        <h3 className="text-[15px] text-fg-muted">Belum ada data laptop</h3>
        <p className="text-[13px]">
          Tidak ada catatan laptop untuk NIP ini di Monitoring Pengadaan Laptop.
        </p>
      </div>
    );
  }

  return laptops.map((laptop) => (
    <div
      key={laptop.id}
      className="mb-2.5 flex items-start justify-between gap-3 rounded-xl border border-line bg-surface2 p-3.5"
    >
      <div>
        <div className="font-semibold">{laptop.NamaPerangkat}</div>
        <div className="mt-0.5 text-xs text-fg-muted">
          SN: {laptop.SerialNumber} · PA: {laptop.PA || "—"} · Regional:{" "}
          {laptop.SBU || "—"}
        </div>
        <div className="mt-1.5">
          <Pill variant={LAPTOP_STATUS_VARIANTS[laptop.Status] ?? "gray"}>
            {laptop.Status || "Belum diisi"}
          </Pill>
        </div>
      </div>
      <ProofThumbnail
        laptop={laptop}
        sizeClass="h-14 w-14"
        emptyLabel="Tanpa bukti"
      />
    </div>
  ));
}
