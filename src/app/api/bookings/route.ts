import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isPastSlot, isSlotBlocked } from "@/lib/slots";
import {
  bookingWhatsAppMessage,
  buildWhatsAppUrl,
  normalizePhone,
} from "@/lib/whatsapp";

const bodySchema = z.object({
  serviceId: z.string().min(1),
  barberId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  customerName: z.string().min(2).max(80),
  phone: z.string().min(7).max(30),
  notes: z.string().max(500).optional(),
  locale: z.enum(["az", "en"]).default("az"),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = bodySchema.parse(json);
    const phone = normalizePhone(data.phone);

    if (phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        {
          error:
            data.locale === "en"
              ? "Enter a valid phone number"
              : "Düzgün telefon nömrəsi daxil edin",
        },
        { status: 400 }
      );
    }

    if (isPastSlot(data.date, data.time)) {
      return NextResponse.json(
        {
          error:
            data.locale === "en"
              ? "Selected time is in the past"
              : "Seçilmiş saat keçmişdədir",
        },
        { status: 400 }
      );
    }

    const [service, barber] = await Promise.all([
      prisma.service.findUnique({ where: { id: data.serviceId } }),
      prisma.barber.findUnique({ where: { id: data.barberId } }),
    ]);

    if (!service || !barber) {
      return NextResponse.json(
        {
          error:
            data.locale === "en"
              ? "Invalid service or barber"
              : "Xidmət və ya usta tapılmadı",
        },
        { status: 400 }
      );
    }

    const sameDay = await prisma.booking.findMany({
      where: {
        barberId: data.barberId,
        date: data.date,
        status: { not: "cancelled" },
      },
      include: { service: { select: { durationMin: true } } },
    });

    const taken = sameDay.map((b) => ({
      time: b.time,
      durationMin: b.service.durationMin || 30,
    }));

    if (isSlotBlocked(data.time, taken, service.durationMin)) {
      return NextResponse.json(
        {
          error:
            data.locale === "en"
              ? "This slot is already booked"
              : "Bu saat artıq rezerv olunub",
        },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        serviceId: data.serviceId,
        barberId: data.barberId,
        date: data.date,
        time: data.time,
        customerName: data.customerName.trim(),
        phone,
        notes: data.notes?.trim() || null,
        locale: data.locale,
        status: "pending",
      },
    });

    const serviceName = data.locale === "en" ? service.nameEn : service.nameAz;
    const barberName = data.locale === "en" ? barber.nameEn : barber.nameAz;
    const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
    const message = bookingWhatsAppMessage({
      locale: data.locale,
      customerName: data.customerName.trim(),
      phone,
      serviceName,
      barberName,
      date: data.date,
      time: data.time,
      notes: data.notes?.trim(),
      price: service.price,
    });
    const whatsappUrl = buildWhatsAppUrl(message, settings?.whatsapp);

    return NextResponse.json({
      booking: {
        id: booking.id,
        date: booking.date,
        time: booking.time,
        status: booking.status,
        serviceName,
        barberName,
        customerName: data.customerName.trim(),
        phone,
        notes: data.notes?.trim() || null,
        price: service.price,
        priceNote:
          data.locale === "en" ? service.priceNoteEn : service.priceNoteAz,
      },
      whatsappUrl,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
