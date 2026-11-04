import { NextResponse } from "next/server";
import { isUnauthorized, unauthorizedResponse } from "@/lib/apiAuth";
import { LEMBUR_MONTH_OPTIONS } from "@/lib/config";
import { getStateCollection } from "@/lib/mongodb";
import { TRACKING_STAGES } from "@/lib/trackingService";

export const dynamic = "force-dynamic";

const STATE_DOCUMENT_ID = "main";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const invalidPayload = (message) =>
  NextResponse.json({ error: "invalid_payload", message }, { status: 400 });

// Hanya field yang dikenal yang disimpan
function sanitizeEntry(entry, stage) {
  if (!entry || !DATE_PATTERN.test(entry.date)) return null;

  const { document } = entry;
  const hasValidDocument =
    document &&
    typeof document.fileId === "string" &&
    typeof document.fileName === "string";
  if (stage.kind === "document" && !hasValidDocument) return null;

  if (!hasValidDocument) return { date: entry.date };
  return {
    date: entry.date,
    document: {
      fileId: document.fileId,
      fileName: document.fileName,
      fileSize: Number(document.fileSize) || 0,
      contentType: String(document.contentType || ""),
    },
  };
}

// entry === null berarti tahap dibatalkan
export async function PUT(request) {
  if (isUnauthorized(request)) return unauthorizedResponse();

  try {
    const { monthLabel, stageKey, entry } = await request
      .json()
      .catch(() => ({}));
    const stage = TRACKING_STAGES.find(({ key }) => key === stageKey);
    if (!LEMBUR_MONTH_OPTIONS.includes(monthLabel) || !stage)
      return invalidPayload("Bulan atau tahap tidak valid.");

    const fieldPath = `lemburTracking.${monthLabel}.${stageKey}`;
    let update;
    if (entry === null) {
      update = { $unset: { [fieldPath]: "" } };
    } else {
      const cleanEntry = sanitizeEntry(entry, stage);
      if (!cleanEntry)
        return invalidPayload("Data tahap tidak valid (tanggal atau dokumen).");
      update = { $set: { [fieldPath]: cleanEntry } };
    }

    const collection = await getStateCollection();
    await collection.updateOne({ _id: STATE_DOCUMENT_ID }, update, {
      upsert: true,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/tracking error:", error);
    return NextResponse.json(
      { error: "server_error", message: error.message },
      { status: 500 },
    );
  }
}
