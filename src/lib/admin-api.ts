import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function assertAdmin() {
  const user = await requireAdmin();
  if (!user) {
    return { user: null as string | null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, error: null };
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
