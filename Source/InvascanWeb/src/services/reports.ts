// src/services/reports.ts
import { authToken } from "@/lib/auth";

// NEW — if VITE_API_BASE_URL is set, use it; otherwise use "" so `/api/...` works via Vite proxy
// const BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const BASE = "./api";

async function authedGet(path: string) {
  const token = authToken.get();
  if (!token) {
    // make it obvious upstream that we need login
    const err = new Error("Not authenticated");
    (err as any).status = 401;
    throw err;
  }

  const r = await fetch(`${BASE}${path}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // <-- SEND TOKEN
    },
  });

  if (!r.ok) {
    const msg = await r.text().catch(() => r.statusText);
    const err = new Error(msg || `Request failed: ${r.status}`);
    (err as any).status = r.status;
    throw err;
  }

  return r.json();
}

export async function getAllProvinceStats() {
  // Most endpoints in your docs wrap results in { status, statusCode, statusMessage, dynamicModel }
  // Return it raw; your query will unwrap to an array.
  return authedGet(`/reports/all_province`);
}

export async function getProvinceStats(province: string) {
  return authedGet(`/reports/province/${encodeURIComponent(province)}`);
}

export async function getAllLocations() {
  return authedGet(`/reports/locationDetails`);
}

export async function getProvinceLocations(province: string) {
  return authedGet(`/reports/locationDetails/province/${encodeURIComponent(province)}`);
}

export async function getYearLocations(year: string | number) {
  return authedGet(`/reports/locationDetails/year/${encodeURIComponent(String(year))}`);
}

export async function getYearMonthLocations(year: string | number, month: string | number) {
  return authedGet(
    `/reports/locationDetails/month/${encodeURIComponent(String(year))}/${encodeURIComponent(String(month))}`,
  );
}
