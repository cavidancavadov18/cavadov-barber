import { NextRequest } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { assertAdmin, badRequest, ok } from "@/lib/admin-api";

export async function POST(req: NextRequest) {
  const gate = await assertAdmin();
  if (gate.error) return gate.error;

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return badRequest("file required");
    if (file.size > 8 * 1024 * 1024) return badRequest("Max 8MB");

    const type = file.type || "";
    if (!type.startsWith("image/")) return badRequest("Only images");

    const ext =
      type === "image/png"
        ? "png"
        : type === "image/webp"
          ? "webp"
          : type === "image/gif"
            ? "gif"
            : "jpg";

    const dir = path.join(process.cwd(), "public", "media", "uploads");
    await mkdir(dir, { recursive: true });
    const name = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, name), buffer);

    return ok({ url: `/media/uploads/${name}` }, 201);
  } catch (error) {
    console.error(error);
    return badRequest("Upload failed");
  }
}
