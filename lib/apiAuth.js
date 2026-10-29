import { NextResponse } from "next/server";

export function isUnauthorized(request) {
  const requiredApiKey = process.env.API_KEY;
  if (!requiredApiKey) return false;
  return request.headers.get("x-api-key") !== requiredApiKey;
}

export const unauthorizedResponse = () =>
  NextResponse.json(
    {
      error: "unauthorized",
      message: "Header x-api-key tidak valid atau tidak ada.",
    },
    { status: 401 },
  );
