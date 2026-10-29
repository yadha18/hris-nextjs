import {
  TRACKING_ALLOWED_MIME_TYPES,
  TRACKING_MAX_FILE_SIZE_MB,
} from "./config";
import { formatDateId } from "./utils";

export const TRACKING_STAGES = [
  {
    key: "reconciliation",
    label: "Proses Rekonsiliasi",
    icon: "📑",
    kind: "checkbox",
  },
  {
    key: "bauk",
    label: "Pembuatan BAUK",
    description: "Berita Acara Unjuk Kerja",
    icon: "📝",
    kind: "checkbox",
  },
  { key: "gr", label: "Pembuatan GR", icon: "📦", kind: "document" },
  { key: "loket", label: "Submit Loket", icon: "📥", kind: "document" },
];

export const EMPTY_TRACKING = Object.freeze({});

const isStageDone = (tracking, stageKey) => Boolean(tracking[stageKey]);

// Tahapan berurutan: boleh diselesaikan bila semua tahap sebelumnya selesai,
// boleh dibatalkan bila tidak ada tahap sesudahnya yang selesai
export function getStageAccess(tracking, stageIndex) {
  const isDone = isStageDone(tracking, TRACKING_STAGES[stageIndex].key);
  const blockingStage = TRACKING_STAGES.slice(0, stageIndex).find(
    ({ key }) => !isStageDone(tracking, key),
  );
  const hasLaterStageDone = TRACKING_STAGES.slice(stageIndex + 1).some(
    ({ key }) => isStageDone(tracking, key),
  );

  return {
    isDone,
    canComplete: !isDone && !blockingStage,
    canUndo: isDone && !hasLaterStageDone,
    blockingStageLabel: blockingStage?.label ?? null,
  };
}

export const countCompletedStages = (tracking) =>
  TRACKING_STAGES.filter(({ key }) => isStageDone(tracking, key)).length;

export const describeStageEntry = ({ date, document }) =>
  `Selesai · ${formatDateId(date)}${document ? ` · ${document.fileName}` : ""}`;

// Dipakai di browser dan server; mengembalikan pesan error atau null
export function validateTrackingFile(file) {
  if (!TRACKING_ALLOWED_MIME_TYPES.includes(file.type))
    return "Format file harus PDF atau gambar (JPG, PNG, WEBP).";
  if (file.size === 0) return "File kosong.";
  if (file.size > TRACKING_MAX_FILE_SIZE_MB * 1024 * 1024)
    return `Ukuran file melebihi ${TRACKING_MAX_FILE_SIZE_MB} MB.`;
  return null;
}
