import { NextResponse } from "next/server";
import { getStateCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const collection = await getStateCollection();
    await collection.findOne({}, { projection: { _id: 1 } });
    return NextResponse.json({ ok: true, mongo: "connected" });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }
}
