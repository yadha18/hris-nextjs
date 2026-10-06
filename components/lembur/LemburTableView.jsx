"use client";

import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@/components/ui/Button";
import DataTable, { Td } from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import FilterBar from "@/components/ui/FilterBar";
import PaginationBar from "@/components/ui/PaginationBar";
import Pill from "@/components/ui/Pill";
import {
  DEFAULT_SBU,
  LEMBUR_BILLING_TYPES,
  LEMBUR_BILLING_VARIANTS,
} from "@/lib/config";
import { exportLemburEntries } from "@/lib/excel";
import { selectLemburLog, selectSelectedMonthLembur } from "@/lib/selectors";
import { formatRupiah } from "@/lib/utils";
import usePagination from "@/hooks/usePagination";
import { openModal, showToast } from "@/store/slices/uiSlice";

const INITIAL_FILTERS = { searchText: "", sbu: "", billingType: "" };
const TABLE_HEADERS = [
  "Aksi",
  "NIP",
  "Nama",
  "Nominal",
  "SBU",
  "Jabatan",
  "Bulan",
  "Tagihan",
];

export default function LemburTableView() {
  const dispatch = useDispatch();
  const selectedMonth = useSelector((state) => state.ui.selectedBulan);
  const monthEntries = useSelector(selectSelectedMonthLembur);
  const lemburLog = useSelector(selectLemburLog);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const filteredEntries = useMemo(() => {
    const query = filters.searchText.toLowerCase();
    return monthEntries.filter(
      (entry) =>
        (!query ||
          entry.NIP.toLowerCase().includes(query) ||
          entry.Nama.toLowerCase().includes(query)) &&
        (!filters.sbu || entry.SBU === filters.sbu) &&
        (!filters.billingType || entry.Tagihan === filters.billingType),
    );
  }, [monthEntries, filters]);

  const {
    currentPage,
    pageSize,
    visibleItems,
    setPage,
    changePageSize,
    goToFirstPage,
  } = usePagination(filteredEntries);

  const updateFilter = (filterName, value) => {
    setFilters((previous) => ({ ...previous, [filterName]: value }));
    goToFirstPage();
  };

  const openEntryModal = (name, entryId) =>
    dispatch(openModal({ name, payload: entryId }));

  const handleDeleteAll = () => {
    if (!monthEntries.length)
      return dispatch(
        showToast(
          `ℹ️ Tidak ada data lembur/SPPD bulan ${selectedMonth} untuk dihapus.`,
        ),
      );
    dispatch(openModal({ name: "deleteAllLembur" }));
  };

  const handleExport = async () => {
    if (!monthEntries.length)
      return dispatch(
        showToast("❌ Tidak ada data untuk diexport pada bulan ini!"),
      );
    await exportLemburEntries({
      entries: monthEntries,
      logEntries: lemburLog,
      monthLabel: selectedMonth,
    });
    dispatch(showToast("✅ Excel berhasil diexport!"));
  };

  const filterSelects = [
    { key: "sbu", placeholder: "Semua SBU", options: DEFAULT_SBU },
    {
      key: "billingType",
      placeholder: "Semua Tagihan",
      options: LEMBUR_BILLING_TYPES,
    },
  ].map((select) => ({
    ...select,
    value: filters[select.key],
    onChange: (value) => updateFilter(select.key, value),
  }));

  return (
    <>
      <div className="mb-3 flex flex-wrap justify-end gap-2.5">
        <Button variant="danger" onClick={handleDeleteAll}>
          🗑 Hapus Semua Data
        </Button>
        <Button onClick={() => openEntryModal("editLembur", null)}>
          ➕ Tambah Data Manual
        </Button>
      </div>

      <FilterBar
        searchValue={filters.searchText}
        searchPlaceholder="🔍  Cari NIP atau Nama..."
        onSearchChange={(value) => updateFilter("searchText", value)}
        selects={filterSelects}
      />

      {filteredEntries.length ? (
        <>
          <DataTable headers={TABLE_HEADERS} minWidthClass="min-w-[900px]">
            {visibleItems.map((entry) => (
              <tr key={entry.id} className="hover:bg-white/[0.02]">
                <Td>
                  <div className="flex gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openEntryModal("editLembur", entry.id)}
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        openEntryModal("confirmDeleteLembur", entry.id)
                      }
                    >
                      🗑
                    </Button>
                  </div>
                </Td>
                <Td className="font-mono text-xs">{entry.NIP}</Td>
                <Td className="font-medium">{entry.Nama || "—"}</Td>
                <Td className="font-mono text-xs">
                  {formatRupiah(entry.Nominal)}
                </Td>
                <Td>{entry.SBU || "—"}</Td>
                <Td>{entry.Jabatan || "—"}</Td>
                <Td>{entry.Bulan || "—"}</Td>
                <Td>
                  <Pill
                    variant={LEMBUR_BILLING_VARIANTS[entry.Tagihan] ?? "gray"}
                  >
                    {entry.Tagihan || "—"}
                  </Pill>
                </Td>
              </tr>
            ))}
          </DataTable>
          <PaginationBar
            page={currentPage}
            pageSize={pageSize}
            totalItems={filteredEntries.length}
            itemLabel="data"
            onPageChange={setPage}
            onPageSizeChange={changePageSize}
          />
        </>
      ) : (
        <EmptyState icon="🧾" title="Tidak ada data" />
      )}

      <div className="mt-5 flex justify-end">
        <Button variant="success" onClick={handleExport}>
          ⬇ Export Excel Data Lembur &amp; SPPD
        </Button>
      </div>
    </>
  );
}
