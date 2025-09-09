// src/services/engine.ts
const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export type InvestigateRequest = {
  user_id: string;
  image_data: string; // base64 without the data: prefix
  latitude: number;
  longitude: number;
  address: string;
};

export type InvestigateResponse = {
  status: boolean;
  statusCode: number;
  statusMessage: string;
  dynamicModel: {
    speciesName: string;
    confidenceScore: number;
    imageData: string;
    imageUrl: string;
  } | null;
};

export async function investigateImage(
  body: InvestigateRequest,
  token?: string
): Promise<InvestigateResponse> {
  const r = await fetch(`${BASE}/api/engine/investigate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
