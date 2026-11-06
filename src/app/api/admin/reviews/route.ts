import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertAdmin, badRequest, ok } from "@/lib/admin-api";

const schema = z.object({
  nameAz: z.string().min(1),
  nameEn: z.string().min(1),
  textAz: z.string().min(1),
  textEn: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  sortOrder: z.coerce.number().int().default(0),
});

export async function GET() {
  const gate = await assertAdmin();
  if (gate.error) return gate.error;
  return ok(await prisma.review.findMany({ orderBy: { sortOrder: "asc" } }));
}

export async function POST(req: NextRequest) {
  const gate = await assertAdmin();
  if (gate.error) return gate.error;
  try {
    const data = schema.parse(await req.json());
    return ok(await prisma.review.create({ data }), 201);
  } catch (error) {
    if (error instanceof z.ZodError) return badRequest("Invalid payload", error.flatten());
    return badRequest("Create failed");
  }
}
