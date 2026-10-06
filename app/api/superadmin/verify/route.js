import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function isMatchingPassword(submittedPassword, expectedPassword) {
  const submittedBytes = Buffer.from(submittedPassword);
  const expectedBytes = Buffer.from(expectedPassword);
  return (
    submittedBytes.length === expectedBytes.length &&
    timingSafeEqual(submittedBytes, expectedBytes)
  );
}

export async function POST(request) {
  const expectedPassword = process.env.SUPERADMIN_PASSWORD;
  if (!expectedPassword) {
    return NextResponse.json(
      {
        error: "config_error",
        message: "SUPERADMIN_PASSWORD belum diset di environment variables.",
      },
      { status: 500 },
    );
  }

  const { password } = await request.json().catch(() => ({}));
  if (
    typeof password !== "string" ||
    !isMatchingPassword(password, expectedPassword)
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
