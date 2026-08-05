import { NextResponse } from "next/server";

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function apiErrorFrom(
  error: unknown,
  message = "Internal server error",
  status = 500
) {
  console.error(`[api] ${message}`, error);
  return apiError(message, status);
}

export function requiredString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseStringArray(value: unknown): string[] | null {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value;
  }
  return null;
}
