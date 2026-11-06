import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [services, barbers] = await Promise.all([
    prisma.service.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.barber.findMany({ orderBy: { experience: "desc" } }),
  ]);

  return NextResponse.json({ services, barbers });
}
