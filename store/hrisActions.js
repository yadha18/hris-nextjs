import {
  buildEmployeeUpdate,
  buildNewEmployee,
  findNewNipCandidates,
  isNipTaken,
} from "@/lib/employeeService";
import { createLogEntry } from "@/lib/models";
import { buildSlotChangeLogEntries } from "@/lib/slotService";
import {
  allEmployeesDeleted,
  employeeAdded,
  employeeDeleted,
  employeeNipsReplaced,
  employeeUpdated,
  saveState,
  slotConfigUpdated,
  uploadApplied,
  laptopStatusesSynced,
} from "@/store/slices/hrisSlice";
import { UPLOAD_TYPES } from "@/lib/upload/uploadRegistry";
import { navigateTo, openLemburMonth, showToast } from "@/store/slices/uiSlice";
import { syncLaptopStatusWithResignedEmployees } from "@/lib/laptopService";

const syncResignedLaptops = () => (dispatch, getState) => {
  const { laptop, karyawan } = getState().hris;
  const result = syncLaptopStatusWithResignedEmployees(laptop, karyawan);
  if (result.syncedCount > 0) dispatch(laptopStatusesSynced(result));
  return result.syncedCount;
};

export const saveEmployee =
  ({ employeeId, formData, statusData }) =>
  (dispatch, getState) => {
    const { karyawan: employees } = getState().hris;

    if (isNipTaken(employees, formData.NIP, employeeId))
      return { success: false, error: "duplicate" };

    if (employeeId === null) {
      dispatch(employeeAdded(buildNewEmployee(formData, statusData)));
    } else {
      const existingEmployee = employees.find(
        (employee) => employee.id === employeeId,
      );
      if (!existingEmployee) return { success: false, error: "not_found" };
      dispatch(
        employeeUpdated(
          buildEmployeeUpdate(existingEmployee, formData, statusData),
        ),
      );
    }

    const syncedLaptopCount = dispatch(syncResignedLaptops());
    dispatch(saveState());
    return { success: true, syncedLaptopCount };
  };

export const deleteEmployee = (employeeId) => (dispatch, getState) => {
  const employee = getState().hris.karyawan.find(
    (existing) => existing.id === employeeId,
  );
  if (!employee) return null;

  const logEntry = createLogEntry({
    nip: employee.NIP,
    name: employee.Nama,
    type: "hapus",
    oldValue: employee.Nama,
    newValue: "(dihapus)",
  });
  dispatch(employeeDeleted({ employeeId, logEntry }));
  dispatch(saveState());
  return employee;
};

export const deleteAllEmployees = () => (dispatch, getState) => {
  const totalDeleted = getState().hris.karyawan.length;
  const logEntry = createLogEntry({
    nip: "SYSTEM",
    name: "SYSTEM",
    type: "hapus semua",
    oldValue: `${totalDeleted} karyawan`,
    newValue: "(semua dihapus)",
  });
  dispatch(allEmployeesDeleted(logEntry));
  dispatch(saveState());
  return totalDeleted;
};

export const applyNewNips = () => (dispatch, getState) => {
  const { applicable } = findNewNipCandidates(getState().hris.karyawan);

  const replacements = applicable.map((employee) => ({
    employeeId: employee.id,
    oldNip: employee.NIP,
    newNip: employee.NIPBaru.trim(),
  }));
  const logEntries = applicable.map((employee, index) =>
    createLogEntry({
      nip: replacements[index].newNip,
      name: employee.Nama,
      type: "nip diperbarui",
      oldValue: replacements[index].oldNip,
      newValue: replacements[index].newNip,
      note: 'NIP diperbarui manual lewat tombol "Cek NIP Baru" — data Lembur/SPPD & Laptop ikut disesuaikan',
    }),
  );

  dispatch(employeeNipsReplaced({ replacements, logEntries }));
  dispatch(saveState());
  return replacements.length;
};

export const saveSlotConfig =
  ({ sbuName, jabatanSlots }) =>
  (dispatch, getState) => {
    const previousSlots = getState().hris.slotConfig[sbuName]?.jabatan ?? {};
    const logEntries = buildSlotChangeLogEntries(
      sbuName,
      previousSlots,
      jabatanSlots,
    );
    if (!logEntries.length) return { hasChanges: false };

    dispatch(slotConfigUpdated({ sbuName, jabatanSlots, logEntries }));
    dispatch(saveState());
    return { hasChanges: true };
  };

export const confirmUpload =
  ({ uploadType, rows }) =>
  (dispatch, getState) => {
    // Diklasifikasi ulang terhadap data terbaru saat konfirmasi, bukan data saat preview
    const { changes, toast, destination } = UPLOAD_TYPES[uploadType].planUpload(
      rows,
      getState().hris,
    );

    dispatch(uploadApplied(changes));
    dispatch(syncResignedLaptops());
    dispatch(saveState());
    dispatch(showToast(toast.message, toast.durationMs));

    if (destination?.lemburMonth)
      dispatch(openLemburMonth(destination.lemburMonth));
    else if (destination?.page) dispatch(navigateTo(destination.page));
  };
