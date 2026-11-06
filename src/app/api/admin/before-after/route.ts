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

export async function GET() {
  const gate = await assertAdmin();
  if (gate.error) return gate.error;
  return ok(await prisma.beforeAfter.findMany({ orderBy: { sortOrder: "asc" } }));
}

export async function POST(req: NextRequest) {
  const gate = await assertAdmin();
  if (gate.error) return gate.error;
  try {
    const data = schema.parse(await req.json());
    return ok(
      await prisma.beforeAfter.create({
        data: { ...data, tiktokUrl: data.tiktokUrl || null },
      }),
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) return badRequest("Invalid payload", error.flatten());
    return badRequest("Create failed");
  }
}
