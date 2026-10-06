"use client";

import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import FilterBar from "@/components/ui/FilterBar";
import PageHeader from "@/components/ui/PageHeader";
import PaginationBar from "@/components/ui/PaginationBar";
import { DEFAULT_SBU, LAPTOP_FILTER_STATUS_OPTIONS } from "@/lib/config";
import { exportLaptopTable } from "@/lib/excel";
import { selectLaptopLog, selectLaptopRows } from "@/lib/selectors";
import usePagination from "@/hooks/usePagination";
import { openModal, showToast } from "@/store/slices/uiSlice";
import LaptopTable from "./LaptopTable";

const INITIAL_FILTERS = { searchText: "", sbu: "", status: "" };

export default function LaptopTablePage() {
  const dispatch = useDispatch();
  const laptopRows = useSelector(selectLaptopRows);
  const laptopLog = useSelector(selectLaptopLog);
  const recordedLaptopCount = useSelector((state) => state.hris.laptop.length);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const filteredRows = useMemo(() => {
    const query = filters.searchText.toLowerCase();
    return laptopRows.filter(
      (row) =>
        (!query ||
          [row.NIP, row.NamaPengguna, row.SerialNumber, row.NamaPerangkat].some(
            (field) => field.toLowerCase().includes(query),
          )) &&
        (!filters.sbu || row.SBU === filters.sbu) &&
        (!filters.status || row.Status === filters.status),
    );
  }, [laptopRows, filters]);

  const {
    currentPage,
    pageSize,
    visibleItems,
    setPage,
    changePageSize,
    goToFirstPage,
  } = usePagination(filteredRows);

  const updateFilter = (filterName, value) => {
    setFilters((previous) => ({ ...previous, [filterName]: value }));
    goToFirstPage();
  };

  const handleDeleteAll = () => {
    if (!recordedLaptopCount)
      return dispatch(showToast("ℹ️ Tidak ada data laptop untuk dihapus."));
    dispatch(openModal({ name: "deleteAllLaptops" }));
  };

  const handleExport = async () => {
    if (!laptopRows.length)
      return dispatch(showToast("❌ Tidak ada data untuk diexport!"));
    await exportLaptopTable({ rows: laptopRows, logEntries: laptopLog });
    dispatch(showToast("✅ Excel berhasil diexport!"));
  };

  const filterSelects = [
    { key: "sbu", placeholder: "Semua SBU", options: DEFAULT_SBU },
    {
      key: "status",
      placeholder: "Semua Status",
      options: LAPTOP_FILTER_STATUS_OPTIONS,
    },
  ].map((select) => ({
    ...select,
    value: filters[select.key],
    onChange: (value) => updateFilter(select.key, value),
  }));

  return (
    <>
      <PageHeader
        title="🧾 Tabel Monitoring Pengadaan Laptop"
        description="Data laptop yang dipinjamkan ke karyawan. Klik nama pengguna untuk lihat riwayat peminjamannya."
        actions={
          <>
            <Button variant="danger" onClick={handleDeleteAll}>
              🗑 Hapus Semua Data
            </Button>
            <Button
              onClick={() =>
                dispatch(
                  openModal({ name: "editLaptop", payload: { entryId: null } }),
                )
              }
            >
              ➕ Tambah Data Manual
            </Button>
          </>
        }
      />

      <FilterBar
        searchValue={filters.searchText}
        searchPlaceholder="🔍  Cari NIP, Nama, atau Serial Number..."
        onSearchChange={(value) => updateFilter("searchText", value)}
        selects={filterSelects}
      />

      {filteredRows.length ? (
        <>
          <LaptopTable
            rows={visibleItems}
            firstRowNumber={(currentPage - 1) * pageSize + 1}
          />
          <PaginationBar
            page={currentPage}
            pageSize={pageSize}
            totalItems={filteredRows.length}
            itemLabel="data"
            onPageChange={setPage}
            onPageSizeChange={changePageSize}
          />
        </>
      ) : (
        <EmptyState icon="💻" title="Tidak ada data" />
      )}

      <div className="mt-5 flex justify-end">
        <Button variant="success" onClick={handleExport}>
          ⬇ Export Excel Monitoring Laptop
        </Button>
      </div>
    </>
  );
}
