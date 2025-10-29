// src/services/user.ts
// NEW — if VITE_API_BASE_URL is set, use it; otherwise use "" so `/api/...` works via Vite proxy
const BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

export type LoggedInUser = {
  UserId: string;
  Firstname: string;
  Lastname: string;
  Username: string;
  EmailAddress: string;
  PhoneNumber: string;
  Location: string;
  ExperienceLevel: string;
  PrivacySetting: string;
  ImageSharingConsent: boolean;
  Role: string;
};

// GET /api/users/ (logged-in user's profile)
export async function getMyProfile(token: string): Promise<LoggedInUser> {
  const r = await fetch(`./api/users/`, {
  // const r = await fetch(`${BASE}/users/`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!r.ok) throw new Error(await r.text());
  const data = await r.json();
  // If backend wraps with { status, statusCode, statusMessage, dynamicModel }, unwrap it:
  return (data?.dynamicModel ?? data) as LoggedInUser;
}

// POST /api/users/ (create account)
export type CreateAccountBody = {
  Firstname: string;
  Lastname: string;
  Username: string;
  EmailAddress: string;
  PhoneNumber: string;
  Location: string;
  ExperienceLevel: string;
  PrivacySetting: string;
  ImageSharingConsent: boolean;
  RoleId: string; // UUID
  password: string;
};

export async function createAccount(body: CreateAccountBody) {
  const r = await fetch(`${BASE}/users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json(); // many backends return {status, statusCode, statusMessage, dynamicModel}
}
