import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertAdmin, badRequest, ok } from "@/lib/admin-api";

const schema = z.object({
  before: z.string().min(1),
  after: z.string().min(1),
  captionAz: z.string().min(1),
  captionEn: z.string().min(1),
  tiktokUrl: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const gate = await assertAdmin();
  if (gate.error) return gate.error;
  const { id } = await ctx.params;
  try {
    const data = schema.parse(await req.json());
    return ok(
      await prisma.beforeAfter.update({
        where: { id },
        data: { ...data, tiktokUrl: data.tiktokUrl || null },
      })
    );
  } catch (error) {
    if (error instanceof z.ZodError) return badRequest("Invalid payload", error.flatten());
    return badRequest("Update failed");
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const gate = await assertAdmin();
  if (gate.error) return gate.error;
  const { id } = await ctx.params;
  await prisma.beforeAfter.delete({ where: { id } });
  return ok({ ok: true });
}
