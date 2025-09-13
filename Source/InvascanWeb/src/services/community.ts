// src/services/community.ts
import { authToken } from "@/lib/auth";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
// ---------- Types from your Swagger ----------
export type Feedback = {
  Id?: string;        // server may generate if omitted
  Comments: string;
  Ratings: number;    // 0..5?
  // Optionally include author fields if backend returns them
  UserId?: string;
  Username?: string;
  CreatedAt?: string;
};

export type FeedbackComment = {
  Id?: string;
  FeedbackId: string;
  Comments: string;
  Ratings: number;    // if not used for comments, set 0
  UserId?: string;
  Username?: string;
  CreatedAt?: string;
};

// ---------- Helpers ----------
async function authedFetch(url: string, init?: RequestInit) {
  const token = authToken.get();
  if (!token) {
    const err = new Error("Not authenticated");
    (err as any).status = 401;
    throw err;
  }

  const r = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
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

function unwrap<T = any>(res: any): T {
  // Your backend often wraps in { status, statusCode, statusMessage, dynamicModel }
  return (res?.dynamicModel ?? res) as T;
}

// ---------- API calls ----------
export async function postFeedback(body: Pick<Feedback, "Comments" | "Ratings">) {
  const res = await authedFetch(`${BASE}/api/users/community/post`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return unwrap<Feedback>(res);
}

export async function getAllFeedback() {
  const res = await authedFetch(`${BASE}/api/users/community/posts`);
  return unwrap<any[]>(res) as Feedback[];
}

export async function getMyFeedback() {
  const res = await authedFetch(`${BASE}/api/users/community/user/posts`);
  return unwrap<any[]>(res) as Feedback[];
}

export async function postFeedbackComment(body: Pick<FeedbackComment, "FeedbackId" | "Comments" | "Ratings">) {
  const res = await authedFetch(`${BASE}/api/users/community/post/comment`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return unwrap<FeedbackComment>(res);
}

export async function getFeedbackComments(feedbackId: string) {
  const url = new URL(`${BASE}/api/users/community/posts/comments`);
  url.searchParams.set("feedback_id", feedbackId);
  const res = await authedFetch(url.toString());
  return unwrap<any[]>(res) as FeedbackComment[];
}
