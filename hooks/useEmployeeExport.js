"use client";

import { useCallback } from "react";
import { useDispatch, useStore } from "react-redux";
import { exportEmployeesToExcel } from "@/lib/excel";
import { showToast } from "@/store/slices/uiSlice";
import { toFileNamePart } from "@/lib/utils";

export default function useEmployeeExport() {
  const dispatch = useDispatch();
  const store = useStore();

  return useCallback(
    async ({ sbu = "", status = "", includeLog = false } = {}) => {
      const { karyawan, log } = store.getState().hris;
      const employees = karyawan.filter(
        (employee) =>
          (!sbu || employee.SBU === sbu) &&
          (!status || employee.Status === status),
      );

      if (!employees.length) {
        dispatch(
          showToast("❌ Tidak ada data karyawan yang cocok untuk diexport!"),
        );
        return;
      }

      await exportEmployeesToExcel({
        employees,
        logEntries: includeLog ? log : [],
        fileSuffix: [sbu, status].filter(Boolean).map(toFileNamePart).join("_"),
      });
      dispatch(showToast("✅ Excel berhasil diexport!"));
    },
    [dispatch, store],
  );
}
