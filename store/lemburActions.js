import { NON_PO_CONFIG_LABELS } from "@/lib/config";
import {
  describeLemburEntry,
  resolveLemburIdentity,
} from "@/lib/lemburService";
import { createLemburEntry, createLogEntry } from "@/lib/models";
import { formatRupiah } from "@/lib/utils";
import {
  lemburEntryDeleted,
  lemburEntrySaved,
  lemburMonthCleared,
  lemburSbuConfigUpdated,
  saveState,
} from "@/store/slices/hrisSlice";

// entryId === null → tambah baru
export const saveLemburEntry =
  ({ entryId, formData }) =>
  (dispatch, getState) => {
    const { karyawan: employees, lembur: lemburEntries } = getState().hris;
    const existingEntry =
      entryId === null
        ? null
        : lemburEntries.find((entry) => entry.id === entryId);
    if (entryId !== null && !existingEntry)
      return { success: false, error: "not_found" };

    const { source, ...identity } = resolveLemburIdentity(
      employees,
      formData.NIP,
      existingEntry,
    );
    const entry = createLemburEntry({
      ...formData,
      ...identity,
      id: existingEntry?.id,
    });

    const logEntry = createLogEntry({
      nip: entry.NIP,
      name: entry.Nama || entry.NIP,
      type: existingEntry ? "lembur edit" : "lembur tambah",
      oldValue: existingEntry ? describeLemburEntry(existingEntry) : "-",
      newValue: describeLemburEntry(entry),
      note: existingEntry ? "Data diedit manual" : "Data ditambahkan manual",
    });

    dispatch(lemburEntrySaved({ entry, logEntry }));
    dispatch(saveState());
    return { success: true, isNew: !existingEntry };
  };

export const deleteLemburEntry = (entryId) => (dispatch, getState) => {
  const entry = getState().hris.lembur.find(
    (existing) => existing.id === entryId,
  );
  if (!entry) return;

  const logEntry = createLogEntry({
    nip: entry.NIP,
    name: entry.Nama || entry.NIP,
    type: "lembur hapus",
    oldValue: describeLemburEntry(entry),
    note: "Baris data lembur/SPPD dihapus manual",
  });
  dispatch(lemburEntryDeleted({ entryId, logEntry }));
  dispatch(saveState());
};

export const clearLemburMonth = (monthLabel) => (dispatch, getState) => {
  const deletedCount = getState().hris.lembur.filter(
    (entry) => entry.Bulan === monthLabel,
  ).length;
  const logEntry = createLogEntry({
    nip: "SYSTEM",
    name: "SYSTEM",
    type: "lembur hapus semua",
    oldValue: `${deletedCount} data (${monthLabel})`,
    newValue: "(semua dihapus)",
  });
  dispatch(lemburMonthCleared({ monthLabel, logEntry }));
  dispatch(saveState());
  return deletedCount;
};

export const updateLemburSbuConfig =
  ({ sbuName, field, value }) =>
  (dispatch, getState) => {
    const previousValue =
      getState().hris.lemburSbuConfig[sbuName]?.[field] || 0;
    if (previousValue === value) return;

    const label = NON_PO_CONFIG_LABELS[field];
    const logEntry = createLogEntry({
      nip: "SYSTEM",
      name: sbuName,
      type: "lembur config",
      oldValue: `${label}: ${formatRupiah(previousValue)}`,
      newValue: `${label}: ${formatRupiah(value)}`,
      note: "Diubah pada Dashboard Non PO",
    });
    dispatch(lemburSbuConfigUpdated({ sbuName, field, value, logEntry }));
    dispatch(saveState());
  };
