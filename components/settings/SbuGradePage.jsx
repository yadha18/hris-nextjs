"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import DataTable, { Td } from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import FilterBar from "@/components/ui/FilterBar";
import PageHeader from "@/components/ui/PageHeader";
import { DEFAULT_GRADE, DEFAULT_SBU, HARGA_SBU_GRADE } from "@/lib/config";
import { filterSbuGradePrices } from "@/lib/sbuGradeService";
import { sortGradeList } from "@/lib/utils";

const INITIAL_FILTERS = { searchText: "", sbu: "", grade: "" };
const TABLE_HEADERS = [
  "SBU",
  "Grade",
  { label: "Harga Satuan", align: "right" },
  { label: "Gaji Pokok", align: "right" },
];
const GRADE_OPTIONS = sortGradeList(DEFAULT_GRADE);
const formatSpacedRupiah = (amount) =>
  `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

export default function SbuGradePage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const visiblePrices = useMemo(
    () => filterSbuGradePrices(HARGA_SBU_GRADE, filters),
    [filters],
  );
  const updateFilter = (filterName, value) =>
    setFilters((previous) => ({ ...previous, [filterName]: value }));

  const filterSelects = [
    { key: "sbu", placeholder: "Semua SBU", options: DEFAULT_SBU },
    { key: "grade", placeholder: "Semua Grade", options: GRADE_OPTIONS },
  ].map((select) => ({
    ...select,
    value: filters[select.key],
    onChange: (value) => updateFilter(select.key, value),
  }));

  return (
    <>
      <PageHeader
        title="📐 Kombinasi SBU & Grade"
        description="Referensi Harga Satuan & Gaji Pokok untuk setiap kombinasi SBU dan Grade."
      />
      <Card>
        <FilterBar
          searchValue={filters.searchText}
          searchPlaceholder="🔍  Cari SBU atau Grade..."
          onSearchChange={(value) => updateFilter("searchText", value)}
          selects={filterSelects}
        />
        {visiblePrices.length ? (
          <>
            <DataTable headers={TABLE_HEADERS}>
              {visiblePrices.map(({ SBU, Grade, HargaSatuan, GajiPokok }) => (
                <tr key={`${SBU}-${Grade}`} className="hover:bg-white/[0.02]">
                  <Td className="font-medium">{SBU}</Td>
                  <Td className="font-mono text-xs">{Grade}</Td>
                  <Td className="text-right font-mono text-xs">
                    {formatSpacedRupiah(HargaSatuan)}
                  </Td>
                  <Td className="text-right font-mono text-xs">
                    {formatSpacedRupiah(GajiPokok)}
                  </Td>
                </tr>
              ))}
            </DataTable>
            <div className="mt-2.5 text-xs text-fg-muted">
              Menampilkan {visiblePrices.length} dari {HARGA_SBU_GRADE.length}{" "}
              kombinasi SBU &amp; Grade
            </div>
          </>
        ) : (
          <EmptyState
            icon="📐"
            title="Tidak ada data"
            description="Coba ubah filter atau kata kunci pencarian."
          />
        )}
      </Card>
    </>
  );
}
