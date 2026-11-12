import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertAdmin, badRequest, ok } from "@/lib/admin-api";

const schema = z
  .object({
    barberId: z.string().min(1).optional(),
    serviceId: z.string().min(1).optional(),
    customerName: z.string().min(2).optional(),
    phone: z.string().min(7).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    locale: z.enum(["az", "en"]).optional(),
    notes: z.string().optional().nullable(),
    status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "Empty update" });

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
        ...(data.notes !== undefined ? { notes: data.notes || null } : {}),
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
