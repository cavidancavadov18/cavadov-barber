import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { assertAdmin, badRequest, ok } from "@/lib/admin-api";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function PUT(req: NextRequest) {
  const gate = await assertAdmin();
  if (gate.error) return gate.error;

  try {
    const body = schema.parse(await req.json());
    const user = await prisma.adminUser.findUnique({ where: { username: gate.user! } });
    if (!user || !verifyPassword(body.currentPassword, user.passwordHash)) {
      return badRequest("Cari şifrə yanlışdır");
    }
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(body.newPassword) },
    });
    return ok({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return badRequest("Invalid payload", error.flatten());
    return badRequest("Update failed");
  }
}
