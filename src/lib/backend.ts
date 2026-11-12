const DEFAULT_BACKEND = "http://127.0.0.1:8000";

export function backendUrl(path = "") {
  const base = (process.env.BACKEND_URL || DEFAULT_BACKEND).replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function backendFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(backendUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Backend ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}
