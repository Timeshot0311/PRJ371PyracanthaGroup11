// src/services/auth.ts
// NEW — if VITE_API_BASE_URL is set, use it; otherwise use "" so `/api/...` works via Vite proxy
const BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const API_BASE  = './api';

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export async function getToken(username: string, password: string): Promise<TokenResponse> {
  const body = new URLSearchParams();
  body.set("grant_type", "password");
  body.set("username", username);
  body.set("password", password);
  body.set("scope", "");

  var endpoint = `${API_BASE}/token`
  console.log(`initiating login: ${endpoint}`)

  //const r = await fetch(`${BASE}/token`, {
  const r = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
