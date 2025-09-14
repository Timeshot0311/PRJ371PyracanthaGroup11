import { API_URL } from "@/lib/utils";

const RAW_BASE = API_URL;
// Build a full URL from a short path (e.g. "/users")
function buildUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  // If VITE_API_BASE_URL is a full URL (http...), append "/api"
  if (/^https?:\/\//i.test(RAW_BASE)) {
    return `${RAW_BASE}/api${p}`; // e.g. http://192.168.68.107:8080/api/users
  }
  // Otherwise it's a proxy prefix like "/api"
  return `${RAW_BASE}${p}`; // e.g. /api/users
}

async function apiFetch(path: string, init?: RequestInit) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    //credentials: init?.credentials ?? "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${res.statusText} at ${url}\n${text}`);
  }

  return res;
}

export async function getJson<T = unknown>(path: string, init?: RequestInit) {
  const res = await apiFetch(path, init);
  return res.json() as Promise<T>;
}

export async function postJson<T = unknown>(
  path: string,
  body: unknown,
  init?: RequestInit,
) {
  return getJson<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    ...init,
  });
}

export { buildUrl, apiFetch };
