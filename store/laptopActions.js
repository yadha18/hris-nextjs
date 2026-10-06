import {
  describeLaptopEntry,
  validateLaptopEntry,
  resolveStatusForHolder,
} from "@/lib/laptopService";
import { createLaptopEntry, createLogEntry } from "@/lib/models";
import {
  allLaptopsDeleted,
  laptopEntryDeleted,
  laptopEntrySaved,
  saveState,
} from "@/store/slices/hrisSlice";
import { findEmployeeByNip } from "@/lib/utils";

// entryId === null → tambah baru
export const saveLaptopEntry =
  ({ entryId, formData }) =>
  (dispatch, getState) => {
    const { karyawan: employees, laptop: laptops } = getState().hris;
    const existingEntry =
      entryId === null ? null : laptops.find((laptop) => laptop.id === entryId);
    if (entryId !== null && !existingEntry)
      return { success: false, errorMessage: "Data tidak ditemukan." };

    const holder = findEmployeeByNip(employees, formData.NIP);
    const resolvedStatus = resolveStatusForHolder(holder, formData.Status);
    const entry = createLaptopEntry({
      ...formData,
      Status: resolvedStatus,
      id: existingEntry?.id,
    });

    const errorMessage = validateLaptopEntry(
      laptops,
      employees,
      entry,
      existingEntry?.id ?? null,
    );
    if (errorMessage) return { success: false, errorMessage };

    const logEntry = createLogEntry({
      nip: entry.NIP || "-",
      name: entry.NamaPengguna,
      type: existingEntry ? "laptop edit" : "laptop tambah",
      oldValue: existingEntry ? describeLaptopEntry(existingEntry) : "-",
      newValue: describeLaptopEntry(entry),
      note: existingEntry ? "Data diedit manual" : "Data ditambahkan manual",
    });

    dispatch(laptopEntrySaved({ entry, logEntry }));
    dispatch(saveState());
    return {
      success: true,
      isNew: !existingEntry,
      wasStatusAdjusted: resolvedStatus !== formData.Status,
    };
  };

export const deleteLaptopEntry = (entryId) => (dispatch, getState) => {
  const entry = getState().hris.laptop.find((laptop) => laptop.id === entryId);
  if (!entry) return;

  const logEntry = createLogEntry({
    nip: entry.NIP || "-",
    name: entry.NamaPengguna || entry.NIP,
    type: "laptop hapus",
    oldValue: `${entry.NamaPerangkat} · ${entry.SerialNumber}`,
    note: "Data laptop dihapus manual",
  });
  dispatch(laptopEntryDeleted({ entryId, logEntry }));
  dispatch(saveState());
};

export const deleteAllLaptops = () => (dispatch, getState) => {
  const deletedCount = getState().hris.laptop.length;
  const logEntry = createLogEntry({
    nip: "SYSTEM",
    name: "SYSTEM",
    type: "laptop hapus semua",
    oldValue: `${deletedCount} data`,
    newValue: "(semua dihapus)",
  });
  dispatch(allLaptopsDeleted(logEntry));
  dispatch(saveState());
  return deletedCount;
};
