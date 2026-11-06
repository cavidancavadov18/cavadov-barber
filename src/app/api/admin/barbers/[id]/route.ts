import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertAdmin, badRequest, ok } from "@/lib/admin-api";

const schema = z.object({
  slug: z.string().min(1),
  nameAz: z.string().min(1),
  nameEn: z.string().min(1),
  roleAz: z.string().min(1),
  roleEn: z.string().min(1),
  bioAz: z.string().min(1),
  bioEn: z.string().min(1),
  image: z.string().min(1),
  experience: z.coerce.number().int().min(0),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const gate = await assertAdmin();
  if (gate.error) return gate.error;
  const { id } = await ctx.params;
  try {
    const data = schema.parse(await req.json());
    const item = await prisma.barber.update({ where: { id }, data });
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
    await prisma.booking.deleteMany({ where: { barberId: id } });
    await prisma.barber.delete({ where: { id } });
    return ok({ ok: true });
  } catch (error) {
    console.error(error);
    return badRequest("Delete failed");
  }
}
