import { NextResponse } from "next/server";

type ApiMeta = {
  page?: number;
  pageSize?: number;
  total?: number;
  source?: "database" | "cache" | "external";
};

export function ok<T>(data: T, status = 200, meta?: ApiMeta) {
  return NextResponse.json({ ok: true, data, meta }, { status });
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        message,
        details,
      },
    },
    { status }
  );
}
