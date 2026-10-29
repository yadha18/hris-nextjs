import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { isUnauthorized, unauthorizedResponse } from "@/lib/apiAuth";
import { getDocumentBucket } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const invalidIdResponse = () =>
  NextResponse.json({ error: "invalid_id" }, { status: 400 });

export async function GET(request, { params }) {
  if (isUnauthorized(request)) return unauthorizedResponse();

  const { fileId } = await params;
  if (!ObjectId.isValid(fileId)) return invalidIdResponse();

  try {
    const bucket = await getDocumentBucket();
    const objectId = new ObjectId(fileId);
    const [fileInfo] = await bucket.find({ _id: objectId }).toArray();
    if (!fileInfo)
      return NextResponse.json({ error: "not_found" }, { status: 404 });

    const chunks = [];
    for await (const chunk of bucket.openDownloadStream(objectId))
      chunks.push(chunk);

    return new Response(Buffer.concat(chunks), {
      headers: {
        "Content-Type": fileInfo.contentType || "application/octet-stream",
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(fileInfo.filename)}`,
      },
    });
  } catch (error) {
    console.error("GET /api/documents error:", error);
    return NextResponse.json(
      { error: "server_error", message: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  if (isUnauthorized(request)) return unauthorizedResponse();

  const { fileId } = await params;
  if (!ObjectId.isValid(fileId)) return invalidIdResponse();

  try {
    const bucket = await getDocumentBucket();
    await bucket.delete(new ObjectId(fileId)).catch((error) => {
      if (!/FileNotFound/i.test(error.name + error.message)) throw error; // sudah terhapus = dianggap berhasil
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/documents error:", error);
    return NextResponse.json(
      { error: "server_error", message: error.message },
      { status: 500 },
    );
  }
}
