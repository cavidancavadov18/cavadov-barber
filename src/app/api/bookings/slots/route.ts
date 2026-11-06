import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDaySlots, isPastSlot, isSlotBlocked } from "@/lib/slots";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const barberId = searchParams.get("barberId");
  const date = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");

  if (!barberId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "barberId and date required" }, { status: 400 });
  }

  const barber = await prisma.barber.findUnique({ where: { id: barberId } });
  if (!barber) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 });
  }

  let durationMin = 30;
  if (serviceId) {
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (service) durationMin = service.durationMin;
  }

  const bookings = await prisma.booking.findMany({
    where: {
      barberId,
      date,
      status: { not: "cancelled" },
    },
    include: { service: { select: { durationMin: true } } },
  });

  const taken = bookings.map((b) => ({
    time: b.time,
    durationMin: b.service.durationMin || 30,
  }));

  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  const hours = {
    start: settings?.weekdayStart ?? 10,
    end: settings?.weekdayEnd ?? 24,
    sundayStart: settings?.sundayStart ?? 10,
    sundayEnd: settings?.sundayEnd ?? 24,
  };

  const slots = generateDaySlots(date, hours).filter(
    (slot) =>
      !isPastSlot(date, slot) && !isSlotBlocked(slot, taken, durationMin)
  );

  return NextResponse.json({ slots, durationMin });
}
