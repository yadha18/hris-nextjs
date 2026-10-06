import { createEmployee, createLogEntry } from "./models";
import { getTodayDate, normalizeEmployeeStatus } from "./utils";

const TRACKED_FIELD_LOG_TYPES = [
  { field: "NIP", logType: "nip" },
  { field: "Jabatan", logType: "jabatan" },
  { field: "SBU", logType: "sbu" },
  { field: "BKOJabatan", logType: "bko jabatan" },
  { field: "BKOSBU", logType: "bko sbu" },
];

// NIP adalah Primary Key
export function isNipTaken(employees, nip, excludedEmployeeId = null) {
  const trimmedNip = String(nip || "").trim();
  return (
    Boolean(trimmedNip) &&
    employees.some(
      (employee) =>
        employee.NIP === trimmedNip && employee.id !== excludedEmployeeId,
    )
  );
}

export function buildNewEmployee(formData, statusData) {
  return createEmployee({
    ...formData,
    Status: statusData.Status,
    StatusCatatan: statusData.Catatan,
  });
}

export function buildEmployeeUpdate(existingEmployee, formData, statusData) {
  const updatedEmployee = createEmployee({
    ...existingEmployee,
    ...formData,
    id: existingEmployee.id,
    TglUpdate: getTodayDate(),
  });

  const logEntries = TRACKED_FIELD_LOG_TYPES.filter(
    ({ field }) =>
      (existingEmployee[field] || "") !== (updatedEmployee[field] || ""),
  ).map(({ field, logType }) =>
    createLogEntry({
      nip: updatedEmployee.NIP,
      name: updatedEmployee.Nama,
      type: logType,
      oldValue: existingEmployee[field],
      newValue: updatedEmployee[field],
    }),
  );

  const nextStatus = normalizeEmployeeStatus(statusData.Status);
  const isStatusChanged =
    existingEmployee.Status !== nextStatus ||
    existingEmployee.StatusCatatan !== statusData.Catatan;
  if (isStatusChanged) {
    logEntries.push(
      createLogEntry({
        nip: updatedEmployee.NIP,
        name: updatedEmployee.Nama,
        type: "status",
        oldValue: existingEmployee.Status,
        newValue: nextStatus,
        note: statusData.Catatan,
      }),
    );
  }

  return {
    employee: {
      ...updatedEmployee,
      Status: nextStatus,
      StatusCatatan: statusData.Catatan,
      StatusManual: isStatusChanged ? true : existingEmployee.StatusManual,
    },
    logEntries,
  };
}

// Karyawan dengan kolom "NIP Baru" terisi: yang bentrok dengan NIP karyawan lain dipisahkan
export function findNewNipCandidates(employees) {
  const applicable = [];
  const conflicts = [];

  employees
    .filter(
      (employee) =>
        employee.NIPBaru?.trim() && employee.NIPBaru.trim() !== employee.NIP,
    )
    .forEach((employee) => {
      const newNip = employee.NIPBaru.trim();
      const hasClash = employees.some(
        (other) => other.id !== employee.id && other.NIP === newNip,
      );
      (hasClash ? conflicts : applicable).push(employee);
    });

  return { applicable, conflicts };
}

export function buildJabatanHistory(employee, logEntries) {
  const jabatanMoves = logEntries
    .filter((entry) => entry.type === "jabatan" && entry.nik === employee.NIP)
    .sort((entryA, entryB) =>
      entryA.ts === entryB.ts
        ? entryA.id - entryB.id
        : entryA.ts.localeCompare(entryB.ts),
    );

  if (!jabatanMoves.length) {
    return [
      {
        jabatan: employee.Jabatan || "—",
        startDate: employee.TglMasuk || null,
        endDate: null,
        isCurrent: true,
      },
    ];
  }

  return [
    {
      jabatan: jabatanMoves[0].oldVal,
      startDate: employee.TglMasuk || jabatanMoves[0].ts,
      endDate: jabatanMoves[0].ts,
      isCurrent: false,
    },
    ...jabatanMoves.map((move, index) => ({
      jabatan: move.newVal,
      startDate: move.ts,
      endDate: jabatanMoves[index + 1]?.ts ?? null,
      isCurrent: index === jabatanMoves.length - 1,
    })),
  ];
}
