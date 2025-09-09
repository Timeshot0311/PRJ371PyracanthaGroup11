// src/services/auth.ts
const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

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

  const r = await fetch(`${BASE}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
