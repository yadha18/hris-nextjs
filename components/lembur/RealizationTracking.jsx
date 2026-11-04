"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@/components/ui/Button";
import DisclosureArrow from "@/components/ui/DisclosureArrow";
import { TextControl } from "@/components/ui/FormField";
import { selectSelectedMonthTracking } from "@/lib/selectors";
import { getTrackingDocumentUrl } from "@/lib/trackingDocuments";
import {
  countCompletedStages,
  getStageAccess,
  TRACKING_STAGES,
} from "@/lib/trackingService";
import { showToast } from "@/store/slices/uiSlice";
import {
  changeStageDate,
  completeCheckboxStage,
  undoStage,
  uploadStageDocument,
} from "@/store/trackingActions";
import DocumentPreviewModal, { DownloadLink } from "./DocumentPreviewModal";

const UNDO_BLOCKED_HINT = "Batalkan tahap setelahnya terlebih dahulu";

function StageCircle({ icon, isDone, isCurrent }) {
  const toneClass = isDone
    ? "border-success bg-success text-white"
    : `bg-surface ${isCurrent ? "border-success text-success" : "border-line-strong text-fg-subtle"}`;

  return (
    <div
      className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] text-lg ${toneClass}`}
    >
      {isDone ? "✓" : icon}
    </div>
  );
}

function UploadButton({ label, disabled, onFileSelected }) {
  return (
    <label
      className={`inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-2.5 py-[5px] text-xs font-medium transition ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:border-accent hover:text-accent-light"
      }`}
    >
      {label}
      <input
        type="file"
        accept=".pdf,image/*"
        disabled={disabled}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files[0];
          event.target.value = ""; // agar file yang sama bisa dipilih ulang
          if (file) onFileSelected(file);
        }}
      />
    </label>
  );
}

function StageControls({ stage, entry, access, isBusy, handlers }) {
  const { isDone, canComplete, canUndo, blockingStageLabel } = access;
  const waitingHint = !isDone && !canComplete && (
    <div className="text-[10px] text-fg-subtle">
      Menunggu: {blockingStageLabel}
    </div>
  );
  const dateInput = entry && (
    <TextControl
      type="date"
      value={entry.date}
      disabled={isBusy}
      onChange={(event) => handlers.changeDate(event.target.value)}
      className="w-[140px] px-2 py-1 text-xs"
    />
  );

  if (stage.kind === "checkbox") {
    const isDisabled = isBusy || (isDone ? !canUndo : !canComplete);
    return (
      <>
        <label
          title={isDone && !canUndo ? UNDO_BLOCKED_HINT : undefined}
          className={`flex items-center gap-2 text-xs ${isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
        >
          <input
            type="checkbox"
            checked={isDone}
            disabled={isDisabled}
            onChange={(event) => handlers.toggleCheckbox(event.target.checked)}
            className="h-4 w-4 accent-success"
          />
          {isBusy ? "Menyimpan..." : isDone ? "Selesai" : "Tandai selesai"}
        </label>
        {dateInput}
        {waitingHint}
      </>
    );
  }

  if (!isDone) {
    return (
      <>
        <UploadButton
          label={isBusy ? "Mengupload..." : "⬆ Upload Dokumen"}
          disabled={!canComplete || isBusy}
          onFileSelected={handlers.upload}
        />
        {waitingHint}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        title={`Pratinjau ${entry.document.fileName}`}
        onClick={() => handlers.preview(entry.document)}
        className="max-w-[170px] cursor-pointer truncate text-xs text-accent-light"
      >
        📎 {entry.document.fileName}
      </button>
      {dateInput}
      <div className="flex flex-wrap gap-1.5 md:justify-center">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handlers.preview(entry.document)}
        >
          👁 Preview
        </Button>
        <DownloadLink documentInfo={entry.document} />
        <UploadButton
          label={isBusy ? "Mengupload..." : "↻ Ganti"}
          disabled={isBusy}
          onFileSelected={handlers.upload}
        />
        <Button
          variant="danger"
          size="sm"
          disabled={!canUndo || isBusy}
          title={canUndo ? undefined : UNDO_BLOCKED_HINT}
          onClick={handlers.undo}
        >
          🗑 Hapus
        </Button>
      </div>
    </>
  );
}

export default function RealizationTracking() {
  const dispatch = useDispatch();
  const selectedMonth = useSelector((state) => state.ui.selectedBulan);
  const tracking = useSelector(selectSelectedMonthTracking);
  const [isOpen, setIsOpen] = useState(false);
  const [busyStageKey, setBusyStageKey] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);

  const completedCount = countCompletedStages(tracking);
  const isAllCompleted = completedCount === TRACKING_STAGES.length;

  const reportFailure = (result) => {
    if (!result.success) dispatch(showToast(`❌ ${result.errorMessage}`, 5000));
  };

  const runWithBusy = async (stageKey, action) => {
    setBusyStageKey(stageKey);
    const result = await action();
    setBusyStageKey(null);
    return result;
  };

  const createHandlers = (stageKey) => {
    const target = { monthLabel: selectedMonth, stageKey };
    return {
      toggleCheckbox: async (shouldComplete) =>
        reportFailure(
          await runWithBusy(stageKey, () =>
            dispatch(
              shouldComplete
                ? completeCheckboxStage(target)
                : undoStage(target),
            ),
          ),
        ),
      undo: async () =>
        reportFailure(
          await runWithBusy(stageKey, () => dispatch(undoStage(target))),
        ),
      changeDate: async (date) =>
        reportFailure(await dispatch(changeStageDate({ ...target, date }))),
      upload: async (file) => {
        const result = await runWithBusy(stageKey, () =>
          dispatch(uploadStageDocument({ ...target, file })),
        );
        if (!result.success) return reportFailure(result);
        dispatch(
          showToast(
            result.isReplacement
              ? "✅ Dokumen berhasil diganti dan tersimpan"
              : "✅ Dokumen berhasil diupload dan tersimpan",
          ),
        );
      },
      preview: (documentInfo) => setPreviewDocument(documentInfo),
    };
  };

  return (
    <>
      <div className="rounded-xl border border-line bg-surface2">
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((previous) => !previous)}
          className="flex w-full cursor-pointer items-center gap-3 px-3.5 py-3 text-left"
        >
          <DisclosureArrow isOpen={isOpen} />
          <span className="flex-1 text-[13px] font-semibold">
            Tracking Proses Penagihan - {selectedMonth}
          </span>
          <span
            className={`text-xs font-semibold ${isAllCompleted ? "text-success" : "text-fg-muted"}`}
          >
            {completedCount} dari {TRACKING_STAGES.length} tahap selesai
          </span>
        </button>

        {isOpen && (
          <ol className="m-0 flex list-none flex-col px-4 pb-5 pt-2 md:flex-row md:gap-2">
            {TRACKING_STAGES.map((stage, stageIndex) => {
              const entry = tracking[stage.key];
              const access = getStageAccess(tracking, stageIndex);
              const isLastStage = stageIndex === TRACKING_STAGES.length - 1;

              return (
                <li
                  key={stage.key}
                  className="relative flex gap-3 pb-6 md:flex-1 md:flex-col md:items-center md:pb-0 md:text-center"
                >
                  {!isLastStage && (
                    <span
                      aria-hidden
                      className={`absolute bottom-0 left-[23px] top-12 w-0.5 md:bottom-auto md:left-1/2 md:top-6 md:h-0.5 md:w-full ${
                        access.isDone ? "bg-success" : "bg-line-strong"
                      }`}
                    />
                  )}
                  <StageCircle
                    icon={stage.icon}
                    isDone={access.isDone}
                    isCurrent={access.canComplete}
                  />
                  <div className="flex min-w-0 flex-col gap-1.5 md:items-center">
                    <div className="text-[13px] font-semibold leading-tight">
                      {stage.label}
                    </div>
                    {stage.description && (
                      <div className="-mt-1 text-[11px] text-fg-muted">
                        {stage.description}
                      </div>
                    )}
                    <StageControls
                      stage={stage}
                      entry={entry}
                      access={access}
                      isBusy={busyStageKey === stage.key}
                      handlers={createHandlers(stage.key)}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
      {previewDocument && (
        <DocumentPreviewModal
          documentInfo={previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </>
  );
}
