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

export async function GET() {
  const gate = await assertAdmin();
  if (gate.error) return gate.error;
  const items = await prisma.barber.findMany({ orderBy: { experience: "desc" } });
  return ok(items);
}

export async function POST(req: NextRequest) {
  const gate = await assertAdmin();
  if (gate.error) return gate.error;
  try {
    const data = schema.parse(await req.json());
    const item = await prisma.barber.create({ data });
    return ok(item, 201);
  } catch (error) {
    if (error instanceof z.ZodError) return badRequest("Invalid payload", error.flatten());
    console.error(error);
    return badRequest("Create failed");
  }
}
