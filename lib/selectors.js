import { createSelector } from "@reduxjs/toolkit";
import { DEFAULT_SBU } from "./config";
import { DEFAULT_LEMBUR_YEARS } from "./config";
import { buildNonPoDashboard } from "./lemburService";
import { buildLaptopDashboard, buildLaptopRows } from "./laptopService";

const selectChangeLogEntries = (state) => state.hris.log;
const selectSlotConfig = (state) => state.hris.slotConfig;
const selectAllEmployees = (state) => state.hris.karyawan;
const selectLemburEntries = (state) => state.hris.lembur;
const selectLemburSbuConfig = (state) => state.hris.lemburSbuConfig;
const selectSelectedMonth = (state) => state.ui.selectedBulan;
const selectLaptopEntries = (state) => state.hris.laptop;

export const selectActiveEmployees = createSelector(
  [selectAllEmployees],
  (employees) =>
    employees.filter(
      (employee) =>
        employee.Status === "Aktif" || employee.Status === "Baru Masuk",
    ),
);

export const selectLemburYears = createSelector(
  [(state) => state.hris.lembur],
  (lemburEntries) => {
    const years = new Set(DEFAULT_LEMBUR_YEARS);
    lemburEntries.forEach(({ Bulan }) => {
      const yearMatch = String(Bulan).match(/\b(20\d{2})\b/);
      if (yearMatch) years.add(Number(yearMatch[1]));
    });
    return [...years].sort((yearA, yearB) => yearA - yearB);
  },
);

export const selectEmployeeStatusCounts = createSelector(
  [selectAllEmployees],
  (employees) => ({
    newHireCount: employees.filter(
      (employee) => employee.Status === "Baru Masuk",
    ).length,
    activeCount: employees.filter((employee) => employee.Status === "Aktif")
      .length,
    resignedCount: employees.filter((employee) => employee.Status === "Resign")
      .length,
  }),
);

// Log Data Karyawan dipisah dari log Lembur & Laptop
export const selectEmployeeChangeLog = createSelector(
  [selectChangeLogEntries],
  (entries) =>
    entries.filter(
      (entry) =>
        !entry.type.startsWith("lembur") && !entry.type.startsWith("laptop"),
    ),
);

export const selectSlotSummary = createSelector(
  [selectSlotConfig, selectActiveEmployees],
  (slotConfig, activeEmployees) => {
    const sbuSlots = Object.entries(slotConfig).map(
      ([sbuName, { jabatan: slotsByJabatan }]) => {
        const jabatanSlots = Object.entries(slotsByJabatan).map(
          ([jabatanName, rawFixedSlots]) => {
            const fixedSlots = Number(rawFixedSlots) || 0;
            const occupants = activeEmployees
              .filter(
                (employee) =>
                  employee.SBU === sbuName && employee.Jabatan === jabatanName,
              )
              .sort((employeeA, employeeB) =>
                employeeA.Nama.localeCompare(employeeB.Nama),
              );
            return {
              jabatanName,
              fixedSlots,
              occupants,
              remainingSlots: fixedSlots - occupants.length,
            };
          },
        );

        const totalFixedSlots = jabatanSlots.reduce(
          (sum, { fixedSlots }) => sum + fixedSlots,
          0,
        );
        const occupiedSlots = activeEmployees.filter(
          (employee) => employee.SBU === sbuName,
        ).length;
        return {
          sbuName,
          jabatanSlots,
          totalFixedSlots,
          occupiedSlots,
          remainingSlots: totalFixedSlots - occupiedSlots,
        };
      },
    );

    const totalFixedSlots = sbuSlots.reduce(
      (sum, sbuSlot) => sum + sbuSlot.totalFixedSlots,
      0,
    );
    return {
      sbuSlots,
      totalFixedSlots,
      occupiedSlots: activeEmployees.length,
      remainingSlots: totalFixedSlots - activeEmployees.length,
    };
  },
);

export const selectSelectedMonthLembur = createSelector(
  [selectLemburEntries, selectSelectedMonth],
  (entries, selectedMonth) =>
    entries.filter((entry) => entry.Bulan === selectedMonth),
);

export const selectNonPoDashboard = createSelector(
  [selectSelectedMonthLembur, selectLemburSbuConfig],
  buildNonPoDashboard,
);

export const selectLemburLog = createSelector(
  [selectChangeLogEntries],
  (entries) => entries.filter((entry) => entry.type.startsWith("lembur")),
);

export const selectLaptopRows = createSelector(
  [selectAllEmployees, selectLaptopEntries],
  buildLaptopRows,
);
export const selectLaptopDashboard = createSelector(
  [selectLaptopRows],
  buildLaptopDashboard,
);
export const selectLaptopLog = createSelector(
  [selectChangeLogEntries],
  (entries) => entries.filter((entry) => entry.type.startsWith("laptop")),
);
