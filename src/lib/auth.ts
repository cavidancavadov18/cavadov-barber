import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { hashPassword, verifyPassword } from "@/lib/password";

export { hashPassword, verifyPassword };

const COOKIE = "admin_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7;

function secret() {
  return process.env.ADMIN_SECRET || "cavadov-barber-admin-dev-secret";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(username: string) {
  const body = Buffer.from(
    JSON.stringify({ u: username, exp: Date.now() + MAX_AGE_SEC * 1000 }),
    "utf8"
  ).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function readSessionToken(token: string | undefined | null) {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqualBuffers(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      u: string;
      exp: number;
    };
    if (!data.u || !data.exp || Date.now() > data.exp) return null;
    return data.u;
  } catch {
    return null;
  }
}

function timingSafeEqualBuffers(a: Buffer, b: Buffer) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) out |= a[i] ^ b[i];
  return out === 0;
}

export async function setAdminSession(username: string) {
  const jar = await cookies();
  jar.set(COOKIE, createSessionToken(username), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.set(COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getAdminUsername() {
  const jar = await cookies();
  return readSessionToken(jar.get(COOKIE)?.value);
}

export async function requireAdmin() {
  const username = await getAdminUsername();
  if (!username) return null;
  return username;
}
