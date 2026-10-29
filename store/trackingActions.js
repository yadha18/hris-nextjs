import { createLogEntry } from "@/lib/models";
import {
  deleteTrackingDocument,
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

function commitStage(
  dispatch,
  { monthLabel, stage, previousEntry, nextEntry, note },
) {
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
  dispatch(saveState());
}

export const completeCheckboxStage =
  ({ monthLabel, stageKey }) =>
  (dispatch, getState) => {
    const { stage, previousEntry, access } = resolveStage(
      getState(),
      monthLabel,
      stageKey,
    );
    if (!access.canComplete)
      return { success: false, errorMessage: blockedMessage(access) };

    commitStage(dispatch, {
      monthLabel,
      stage,
      previousEntry,
      nextEntry: { date: getTodayDate() },
    });
    return { success: true };
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
      return { success: false, errorMessage: blockedMessage(access) };

    const fileError = validateTrackingFile(file);
    if (fileError) return { success: false, errorMessage: fileError };

    try {
      const document = await uploadTrackingDocument(file);
      commitStage(dispatch, {
        monthLabel,
        stage,
        previousEntry,
        nextEntry: { date: getTodayDate(), document },
        note: previousEntry ? "Dokumen diganti" : undefined,
      });
      if (previousEntry?.document)
        deleteTrackingDocument(previousEntry.document.fileId);
      return { success: true, isReplacement: Boolean(previousEntry) };
    } catch (error) {
      return { success: false, errorMessage: error.message };
    }
  };

// Membatalkan ceklis atau menghapus dokumen
export const undoStage =
  ({ monthLabel, stageKey }) =>
  (dispatch, getState) => {
    const { stage, previousEntry, access } = resolveStage(
      getState(),
      monthLabel,
      stageKey,
    );
    if (!access.canUndo)
      return {
        success: false,
        errorMessage: "Batalkan tahap setelahnya terlebih dahulu.",
      };

    commitStage(dispatch, {
      monthLabel,
      stage,
      previousEntry,
      nextEntry: null,
    });
    if (previousEntry.document)
      deleteTrackingDocument(previousEntry.document.fileId);
    return { success: true };
  };

export const changeStageDate =
  ({ monthLabel, stageKey, date }) =>
  (dispatch, getState) => {
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
      return;

    commitStage(dispatch, {
      monthLabel,
      stage,
      previousEntry,
      nextEntry: { ...previousEntry, date },
      note: "Tanggal diubah manual",
    });
  };
