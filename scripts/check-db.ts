import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const services = await prisma.service.findMany();
  const barbers = await prisma.barber.findMany();
  const bookings = await prisma.booking.count();
  console.log(
    JSON.stringify(
      {
        services: services.map((s) => ({ id: s.id, slug: s.slug })),
        barbers: barbers.map((b) => ({ id: b.id, slug: b.slug })),
        bookings,
      },
      null,
      2
    )
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
