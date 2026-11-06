import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertAdmin, badRequest, ok } from "@/lib/admin-api";

const schema = z.object({
  addressAz: z.string().min(1),
  addressEn: z.string().min(1),
  phoneDisplay: z.string().min(1),
  phoneTel: z.string().min(1),
  whatsapp: z.string().min(1),
  email: z.string().min(1),
  hoursAz: z.string().min(1),
  hoursEn: z.string().min(1),
  weekdayStart: z.coerce.number().int().min(0).max(23),
  weekdayEnd: z.coerce.number().int().min(1).max(24),
  sundayStart: z.coerce.number().int().min(0).max(23),
  sundayEnd: z.coerce.number().int().min(1).max(24),
  mapEmbedUrl: z.string().min(1),
  tiktokProfile: z.string().min(1),
  heroVideo: z.string(),
  heroImage: z.string().min(1),
  aboutImage: z.string().min(1),
  brandAvatar: z.string().min(1),
});

export async function GET() {
  const gate = await assertAdmin();
  if (gate.error) return gate.error;
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  return ok(settings);
}

export async function PUT(req: NextRequest) {
  const gate = await assertAdmin();
  if (gate.error) return gate.error;
  try {
    const data = schema.parse(await req.json());
    const settings = await prisma.siteSettings.upsert({
      where: { id: "main" },
      update: data,
      create: { id: "main", ...data },
    });
    return ok(settings);
  } catch (error) {
    if (error instanceof z.ZodError) return badRequest("Invalid payload", error.flatten());
    return badRequest("Update failed");
  }
}
