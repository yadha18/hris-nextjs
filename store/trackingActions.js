import { createLogEntry } from "@/lib/models";
import {
  deleteTrackingDocument,
  persistTrackingStage,
  uploadTrackingDocument,
} from "@/lib/trackingDocuments";
import {
  describeStageEntry,
  EMPTY_TRACKING,
  getStageAccess,
  TRACKING_STAGES,
  validateTrackingFile,
} from "@/lib/trackingService";
import { getTodayDate } from "@/lib/utils";
import { saveState, trackingStageUpdated } from "@/store/slices/hrisSlice";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SUCCESS = { success: true };

function resolveStage(state, monthLabel, stageKey) {
  const stageIndex = TRACKING_STAGES.findIndex(({ key }) => key === stageKey);
  const tracking = state.hris.lemburTracking[monthLabel] ?? EMPTY_TRACKING;
  return {
    stage: TRACKING_STAGES[stageIndex],
    previousEntry: tracking[stageKey] ?? null,
    access: getStageAccess(tracking, stageIndex),
  };
}

const blockedMessage = ({ blockingStageLabel }) =>
  `Selesaikan "${blockingStageLabel}" terlebih dahulu.`;
const failure = (errorMessage) => ({ success: false, errorMessage });

// Simpan ke server dulu; tampilan & log baru berubah setelah server mengonfirmasi
async function commitStage(
  dispatch,
  { monthLabel, stage, previousEntry, nextEntry, note },
) {
  await persistTrackingStage({
    monthLabel,
    stageKey: stage.key,
    entry: nextEntry,
  });

  const logEntry = createLogEntry({
    nip: "SYSTEM",
    name: `${monthLabel} · ${stage.label}`,
    type: "lembur tracking",
    oldValue: previousEntry
      ? describeStageEntry(previousEntry)
      : "Belum selesai",
    newValue: nextEntry ? describeStageEntry(nextEntry) : "Dibatalkan",
    note,
  });
  dispatch(
    trackingStageUpdated({
      monthLabel,
      stageKey: stage.key,
      entry: nextEntry,
      logEntry,
    }),
  );
  dispatch(saveState()); // hanya untuk menyimpan log; tracking sudah tersimpan di atas
}

export const completeCheckboxStage =
  ({ monthLabel, stageKey }) =>
  async (dispatch, getState) => {
    const { stage, previousEntry, access } = resolveStage(
      getState(),
      monthLabel,
      stageKey,
    );
    if (!access.canComplete) return failure(blockedMessage(access));

    try {
      await commitStage(dispatch, {
        monthLabel,
        stage,
        previousEntry,
        nextEntry: { date: getTodayDate() },
      });
      return SUCCESS;
    } catch (error) {
      return failure(error.message);
    }
  };

export const uploadStageDocument =
  ({ monthLabel, stageKey, file }) =>
  async (dispatch, getState) => {
    const { stage, previousEntry, access } = resolveStage(
      getState(),
      monthLabel,
      stageKey,
    );
    if (!access.isDone && !access.canComplete)
      return failure(blockedMessage(access));

    const fileError = validateTrackingFile(file);
    if (fileError) return failure(fileError);

    let uploadedDocument = null;
    try {
      uploadedDocument = await uploadTrackingDocument(file);
      await commitStage(dispatch, {
        monthLabel,
        stage,
        previousEntry,
        nextEntry: { date: getTodayDate(), document: uploadedDocument },
        note: previousEntry ? "Dokumen diganti" : undefined,
      });
      if (previousEntry?.document)
        deleteTrackingDocument(previousEntry.document.fileId);
      return { success: true, isReplacement: Boolean(previousEntry) };
    } catch (error) {
      if (uploadedDocument) deleteTrackingDocument(uploadedDocument.fileId); // file yatim bila tahap gagal tersimpan
      return failure(error.message);
    }
  };

// Membatalkan ceklis atau menghapus dokumen
export const undoStage =
  ({ monthLabel, stageKey }) =>
  async (dispatch, getState) => {
    const { stage, previousEntry, access } = resolveStage(
      getState(),
      monthLabel,
      stageKey,
    );
    if (!access.canUndo)
      return failure("Batalkan tahap setelahnya terlebih dahulu.");

    try {
      await commitStage(dispatch, {
        monthLabel,
        stage,
        previousEntry,
        nextEntry: null,
      });
      if (previousEntry.document)
        deleteTrackingDocument(previousEntry.document.fileId);
      return SUCCESS;
    } catch (error) {
      return failure(error.message);
    }
  };

export const changeStageDate =
  ({ monthLabel, stageKey, date }) =>
  async (dispatch, getState) => {
    const { stage, previousEntry } = resolveStage(
      getState(),
      monthLabel,
      stageKey,
    );
    if (
      !previousEntry ||
      !DATE_PATTERN.test(date) ||
      date === previousEntry.date
    )
      return SUCCESS;

    try {
      await commitStage(dispatch, {
        monthLabel,
        stage,
        previousEntry,
        nextEntry: { ...previousEntry, date },
        note: "Tanggal diubah manual",
      });
      return SUCCESS;
    } catch (error) {
      return failure(error.message);
    }
  };
