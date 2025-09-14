// src/services/community.ts
const BASE = API_URL;

import { env } from "@/env";
import { authToken } from "@/lib/auth";
import { API_URL } from "@/lib/utils";
import { en } from "zod/v4/locales";

// ---------- Types ----------
export type Feedback = {
  Id?: string;
  Comments: string;
  Ratings: number;
  UserId?: string;
  Username?: string;
  CreatedAt?: string;
};

export type FeedbackComment = {
  Id?: string;
  FeedbackId: string;
  Comments: string;
  Ratings: number;
  UserId?: string;
  Username?: string;
  CreatedAt?: string;
};

// ---------- Envelope ----------
type ApiEnvelope<T> = {
  status?: boolean;
  statusCode?: number;
  statusMessage?: string;
  dynamicModel?: T;
};

// ---------- Helpers ----------
async function authed<T>(fn: (token: string) => Promise<T>) {
  const token = authToken.get();
  if (!token) {
    const err = new Error("Not authenticated");
    (err as any).status = 401;
    throw err;
  }
  return fn(token);
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  // All our API routes are under /api/...
  const url = `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const r = await fetch(url, init);
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}

function jsonHeaders(token?: string) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ---------- API calls ----------
export async function postFeedback(
  body: Pick<Feedback, "Comments" | "Ratings"> & { Id?: string },
) {
  return authed(async (token) => {
    // CREATE => Id must be "" (or null); UPDATE => pass body.Id
    const payload = {
      Id: body.Id ?? "",
      Comments: String(body.Comments ?? ""),
      Ratings: Number(body.Ratings) || 0,
    };

    const res = await fetch(`${API_URL}/api/users/community/post`, {
      method: "POST",
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    });

    const resJson = await res.json();

    console.debug("POST /api/users/community/post ->", res);
    if (resJson?.status === false)
      throw new Error(resJson.statusMessage || "API status:false");
    return (resJson?.dynamicModel ?? (res as any)) as Feedback;
  });
}

export async function getAllFeedback() {
  return authed(async (token) => {
    const res = await fetch(`${API_URL}/api/users/community/posts`, {
      headers: jsonHeaders(token),
    });
    const resJson = await res.json();
    console.debug("GET /api/users/community/posts ->", res);
    if (resJson?.status === false)
      throw new Error(resJson.statusMessage || "API status:false");
    return (resJson?.dynamicModel ?? (res as any)) as Feedback[];
  });
}

export async function getMyFeedback() {
  return authed(async (token) => {
    const res = await fetch(`${API_URL}/api/users/community/user/posts`, {
      headers: jsonHeaders(token),
    });

    const resJson = await res.json();
    console.debug("GET /api/users/community/user/posts ->", res);
    if (resJson?.status === false)
      throw new Error(resJson.statusMessage || "API status:false");
    return (resJson?.dynamicModel ?? (res as any)) as Feedback[];
  });
}

export async function postFeedbackComment(
  body: Pick<FeedbackComment, "FeedbackId" | "Comments" | "Ratings"> & {
    Id?: string;
  },
) {
  return authed(async (token) => {
    // CREATE => Id ""; UPDATE => pass body.Id
    const payload = {
      Id: body.Id ?? "",
      FeedbackId: String(body.FeedbackId),
      Comments: String(body.Comments ?? ""),
      Ratings: Number(body.Ratings) || 0,
    };

    const res = await fetch(`${API_URL}/api/users/community/post/comment`, {
      method: "POST",
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    });

    const resJson = await res.json();

    console.debug("POST /api/users/community/post/comment ->", res);
    if (resJson?.status === false)
      throw new Error(resJson.statusMessage || "API status:false");
    return (resJson?.dynamicModel ?? (res as any)) as FeedbackComment;
  });
}

export async function getFeedbackComments(feedbackId: string) {
  return authed(async (token) => {
    const res = await fetchJson<ApiEnvelope<FeedbackComment[]>>(
      `/api/users/community/posts/comments?feedback_id=${encodeURIComponent(feedbackId)}`,
      { headers: jsonHeaders(token) },
    );
    console.debug("GET /api/users/community/posts/comments ->", res);
    if (res?.status === false)
      throw new Error(res.statusMessage || "API status:false");
    return (res?.dynamicModel ?? (res as any)) as FeedbackComment[];
  });
}
