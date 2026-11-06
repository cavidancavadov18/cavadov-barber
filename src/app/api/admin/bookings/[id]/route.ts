import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertAdmin, badRequest, ok } from "@/lib/admin-api";

const schema = z.object({
  barberId: z.string().min(1),
  serviceId: z.string().min(1),
  customerName: z.string().min(2),
  phone: z.string().min(7),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  locale: z.enum(["az", "en"]).default("az"),
  notes: z.string().optional().nullable(),
  status: z.enum(["confirmed", "cancelled", "completed"]),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const gate = await assertAdmin();
  if (gate.error) return gate.error;
  const { id } = await ctx.params;
  try {
    const data = schema.parse(await req.json());
    const item = await prisma.booking.update({
      where: { id },
      data: {
        ...data,
        notes: data.notes || null,
      },
      include: {
        service: { select: { id: true, nameAz: true, price: true } },
        barber: { select: { id: true, nameAz: true } },
      },
    });
    return ok(item);
  } catch (error) {
    if (error instanceof z.ZodError) return badRequest("Invalid payload", error.flatten());
    console.error(error);
    return badRequest("Update failed");
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const gate = await assertAdmin();
  if (gate.error) return gate.error;
  const { id } = await ctx.params;
  try {
    await prisma.booking.delete({ where: { id } });
    return ok({ ok: true });
  } catch (error) {
    console.error(error);
    return badRequest("Delete failed");
  }
}
