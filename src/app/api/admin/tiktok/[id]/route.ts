import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertAdmin, badRequest, ok } from "@/lib/admin-api";

const schema = z.object({
  tiktokId: z.string().min(1),
  url: z.string().min(1),
  cover: z.string().min(1),
  titleAz: z.string().min(1),
  titleEn: z.string().min(1),
  focus: z.string().default("object-center"),
  sortOrder: z.coerce.number().int().default(0),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const gate = await assertAdmin();
  if (gate.error) return gate.error;
  const { id } = await ctx.params;
  try {
    const data = schema.parse(await req.json());
    return ok(await prisma.tikTokVideo.update({ where: { id }, data }));
  } catch (error) {
    if (error instanceof z.ZodError) return badRequest("Invalid payload", error.flatten());
    return badRequest("Update failed");
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const gate = await assertAdmin();
  if (gate.error) return gate.error;
  const { id } = await ctx.params;
  await prisma.tikTokVideo.delete({ where: { id } });
  return ok({ ok: true });
}
