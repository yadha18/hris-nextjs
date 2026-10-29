import { finished } from "node:stream/promises";
import { NextResponse } from "next/server";
import { isUnauthorized, unauthorizedResponse } from "@/lib/apiAuth";
import { getDocumentBucket } from "@/lib/mongodb";
import { validateTrackingFile } from "@/lib/trackingService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  if (isUnauthorized(request)) return unauthorizedResponse();

  try {
    const file = (await request.formData()).get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json(
        {
          error: "invalid_file",
          message: "File tidak ditemukan pada request.",
        },
        { status: 400 },
      );
    }

    const validationMessage = validateTrackingFile(file);
    if (validationMessage) {
      return NextResponse.json(
        { error: "invalid_file", message: validationMessage },
        { status: 400 },
      );
    }

    const bucket = await getDocumentBucket();
    const uploadStream = bucket.openUploadStream(file.name, {
      contentType: file.type,
    });
    uploadStream.end(Buffer.from(await file.arrayBuffer()));
    await finished(uploadStream);

    return NextResponse.json({
      fileId: String(uploadStream.id),
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
    });
  } catch (error) {
    console.error("POST /api/documents error:", error);
    return NextResponse.json(
      { error: "server_error", message: error.message },
      { status: 500 },
    );
  }
}
