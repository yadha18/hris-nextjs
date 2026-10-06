import { NextResponse } from "next/server";
import { getStateCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic"; // jangan di-cache oleh Next.js

const STATE_DOCUMENT_ID = "main";

const DEFAULT_STATE = {
  karyawan: [],
  jabatan: [],
  log: [],
  slotConfig: {},
  lembur: [],
  lemburSbuConfig: {},
  tiketHPI: 0,
  laptop: [],
  subBidang: [],
};

function isUnauthorized(request) {
  const requiredApiKey = process.env.API_KEY;
  if (!requiredApiKey) return false;
  return request.headers.get("x-api-key") !== requiredApiKey;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export async function GET(request) {
  if (isUnauthorized(request)) {
    return NextResponse.json(
      {
        error: "unauthorized",
        message: "Header x-api-key tidak valid atau tidak ada.",
      },
      { status: 401 },
    );
  }

  try {
    const collection = await getStateCollection();
    const savedState = await collection.findOne(
      { _id: STATE_DOCUMENT_ID },
      { projection: { _id: 0 } },
    );
    return NextResponse.json(savedState || DEFAULT_STATE);
  } catch (error) {
    console.error("GET /api/state error:", error);
    return NextResponse.json(
      { error: "server_error", message: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  if (isUnauthorized(request)) {
    return NextResponse.json(
      {
        error: "unauthorized",
        message: "Header x-api-key tidak valid atau tidak ada.",
      },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const {
      karyawan,
      jabatan,
      log,
      slotConfig,
      lembur,
      lemburSbuConfig,
      tiketHPI,
      laptop,
      subBidang,
    } = body;

    if (![karyawan, jabatan, log].every(Array.isArray)) {
      return NextResponse.json(
        {
          error: "invalid_payload",
          message: "karyawan, jabatan, dan log harus berupa array.",
        },
        { status: 400 },
      );
    }

    const collection = await getStateCollection();
    await collection.updateOne(
      { _id: STATE_DOCUMENT_ID },
      {
        $set: {
          karyawan,
          jabatan,
          log,
          slotConfig: slotConfig || {},
          lembur: asArray(lembur),
          lemburSbuConfig: lemburSbuConfig || {},
          tiketHPI: Number(tiketHPI) || 0,
          laptop: asArray(laptop),
          subBidang: asArray(subBidang),
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/state error:", error);
    return NextResponse.json(
      { error: "server_error", message: error.message },
      { status: 500 },
    );
  }
}
