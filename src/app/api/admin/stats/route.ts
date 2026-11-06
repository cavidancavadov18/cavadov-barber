import { prisma } from "@/lib/prisma";
import { assertAdmin, ok } from "@/lib/admin-api";

export async function GET() {
  const gate = await assertAdmin();
  if (gate.error) return gate.error;

  const [services, barbers, bookings, gallery, reviews, tiktok, confirmed, cancelled] =
    await Promise.all([
      prisma.service.count(),
      prisma.barber.count(),
      prisma.booking.count(),
      prisma.galleryItem.count(),
      prisma.review.count(),
      prisma.tikTokVideo.count(),
      prisma.booking.count({ where: { status: "confirmed" } }),
      prisma.booking.count({ where: { status: "cancelled" } }),
    ]);

  const recent = await prisma.booking.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      service: { select: { nameAz: true } },
      barber: { select: { nameAz: true } },
    },
  });

  return ok({
    counts: {
      services,
      barbers,
      bookings,
      gallery,
      reviews,
      tiktok,
      confirmed,
      cancelled,
    },
    recent,
  });
}
