import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertAdmin, badRequest, ok } from "@/lib/admin-api";

const schema = z.object({
  kind: z.enum(["banner", "tile"]).default("tile"),
  src: z.string().min(1),
  alt: z.string().min(1),
  labelAz: z.string().min(1),
  labelEn: z.string().min(1),
  sortOrder: z.coerce.number().int().default(0),
});

export async function GET() {
  const gate = await assertAdmin();
  if (gate.error) return gate.error;
  return ok(await prisma.workItem.findMany({ orderBy: { sortOrder: "asc" } }));
}

export async function POST(req: NextRequest) {
  const gate = await assertAdmin();
  if (gate.error) return gate.error;
  try {
    const data = schema.parse(await req.json());
    return ok(await prisma.workItem.create({ data }), 201);
  } catch (error) {
    if (error instanceof z.ZodError) return badRequest("Invalid payload", error.flatten());
    return badRequest("Create failed");
  }
}
