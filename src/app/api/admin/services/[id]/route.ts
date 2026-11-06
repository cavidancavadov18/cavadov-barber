import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertAdmin, badRequest, ok } from "@/lib/admin-api";

const schema = z.object({
  slug: z.string().min(1),
  nameAz: z.string().min(1),
  nameEn: z.string().min(1),
  descriptionAz: z.string().min(1),
  descriptionEn: z.string().min(1),
  price: z.coerce.number().int().min(0),
  priceNoteAz: z.string().optional().nullable(),
  priceNoteEn: z.string().optional().nullable(),
  durationMin: z.coerce.number().int().min(5),
  image: z.string().min(1),
  sortOrder: z.coerce.number().int().default(0),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const gate = await assertAdmin();
  if (gate.error) return gate.error;
  const { id } = await ctx.params;
  try {
    const data = schema.parse(await req.json());
    const item = await prisma.service.update({
      where: { id },
      data: {
        ...data,
        priceNoteAz: data.priceNoteAz || null,
        priceNoteEn: data.priceNoteEn || null,
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
    await prisma.booking.deleteMany({ where: { serviceId: id } });
    await prisma.service.delete({ where: { id } });
    return ok({ ok: true });
  } catch (error) {
    console.error(error);
    return badRequest("Delete failed");
  }
}
