import { createLogEntry } from "./models";
import {
  countFullMonthsBetween,
  findPriceBySbuAndGrade,
  generateId,
  getTodayDate,
} from "./utils";

// Gaji Pokok & Harga Satuan selalu mengikuti kombinasi SBU + Grade
export function syncEmployeePrices(employees) {
  let syncedCount = 0;

  const syncedEmployees = employees.map((employee) => {
    const expectedPrice = findPriceBySbuAndGrade(employee.SBU, employee.Grade);
    const isOutOfSync =
      expectedPrice &&
      (employee.HargaSatuan !== expectedPrice.HargaSatuan ||
        employee.GajiPokok !== expectedPrice.GajiPokok);
    if (!isOutOfSync) return employee;

    syncedCount += 1;
    return {
      ...employee,
      HargaSatuan: expectedPrice.HargaSatuan,
      GajiPokok: expectedPrice.GajiPokok,
    };
  });

  return { employees: syncedEmployees, syncedCount };
}

function repairDuplicateIds(employees) {
  const seenIds = new Set();
  let repairedIdCount = 0;

  const repairedEmployees = employees.map((employee) => {
    let repairedEmployee = employee;
    if (seenIds.has(employee.id)) {
      repairedEmployee = { ...employee, id: generateId() };
      repairedIdCount += 1;
    }
    seenIds.add(repairedEmployee.id);
    return repairedEmployee;
  });

  return { employees: repairedEmployees, repairedIdCount };
}

// "Baru Masuk" → "Aktif" setelah genap 1 bulan sejak Tanggal Masuk
function promoteNewHires(employees) {
  const logEntries = [];

  const promotedEmployees = employees.map((employee) => {
    if (employee.Status !== "Baru Masuk") return employee;

    const fullMonths = countFullMonthsBetween(employee.TglMasuk);
    if (fullMonths === null || fullMonths < 1) return employee;

    logEntries.push(
      createLogEntry({
        nip: employee.NIP,
        name: employee.Nama,
        type: "status",
        oldValue: "Baru Masuk",
        newValue: "Aktif",
        note: "Otomatis diubah sistem — sudah genap 1 bulan sejak Tanggal Masuk",
      }),
    );
    return { ...employee, Status: "Aktif", TglUpdate: getTodayDate() };
  });

  return { employees: promotedEmployees, logEntries };
}

export function runEmployeeMaintenance(employees) {
  const { employees: pricedEmployees, syncedCount } =
    syncEmployeePrices(employees);
  const { employees: repairedEmployees, repairedIdCount } =
    repairDuplicateIds(pricedEmployees);
  const { employees: maintainedEmployees, logEntries } =
    promoteNewHires(repairedEmployees);

  const summary = {
    repairedIdCount,
    syncedPriceCount: syncedCount,
    promotedToActiveCount: logEntries.length,
  };
  const hasChanges = Object.values(summary).some((count) => count > 0);

  return { employees: maintainedEmployees, logEntries, summary, hasChanges };
}
