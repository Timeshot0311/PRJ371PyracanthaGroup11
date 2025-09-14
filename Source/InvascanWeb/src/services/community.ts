// src/services/community.ts
import { authToken } from "@/lib/auth";
import { getJson, postJson } from "@/lib/api";

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

// ---------- Helpers ----------
async function authed<T>(fn: () => Promise<T>) {
  const token = authToken.get();
  if (!token) {
    const err = new Error("Not authenticated");
    (err as any).status = 401;
    throw err;
  }
  return fn();
}

// API envelope
type ApiEnvelope<T> = {
  status?: boolean;
  statusCode?: number;
  statusMessage?: string;
  dynamicModel?: T;
};

// ---------- API calls ----------
export async function postFeedback(
  body: Pick<Feedback, "Comments" | "Ratings"> & { Id?: string }
) {
  return authed(async () => {
    // CREATE => Id must be "" (or null); UPDATE => pass body.Id
    const payload = {
      Id: body.Id ?? "", // empty string for new posts
      Comments: String(body.Comments ?? ""),
      Ratings: Number(body.Ratings) || 0,
    };

    const res = await postJson<ApiEnvelope<Feedback>>("/users/community/post", payload, {
      headers: { Authorization: `Bearer ${authToken.get()}` },
    });

    console.debug("POST /users/community/post ->", res);
    if (res?.status === false) throw new Error(res.statusMessage || "API status:false");
    return (res?.dynamicModel ?? (res as any)) as Feedback;
  });
}

export async function getAllFeedback() {
  return authed(async () => {
    const res = await getJson<ApiEnvelope<Feedback[]>>("/users/community/posts", {
      headers: { Authorization: `Bearer ${authToken.get()}` },
    });
    console.debug("GET /users/community/posts ->", res);
    if (res?.status === false) throw new Error(res.statusMessage || "API status:false");
    return (res?.dynamicModel ?? (res as any)) as Feedback[];
  });
}

export async function getMyFeedback() {
  return authed(async () => {
    const res = await getJson<ApiEnvelope<Feedback[]>>("/users/community/user/posts", {
      headers: { Authorization: `Bearer ${authToken.get()}` },
    });
    console.debug("GET /users/community/user/posts ->", res);
    if (res?.status === false) throw new Error(res.statusMessage || "API status:false");
    return (res?.dynamicModel ?? (res as any)) as Feedback[];
  });
}

export async function postFeedbackComment(
  body: Pick<FeedbackComment, "FeedbackId" | "Comments" | "Ratings"> & { Id?: string }
) {
  return authed(async () => {
    // CREATE => Id ""; UPDATE => pass body.Id
    const payload = {
      Id: body.Id ?? "", // empty string for new comments
      FeedbackId: String(body.FeedbackId),
      Comments: String(body.Comments ?? ""),
      Ratings: Number(body.Ratings) || 0,
    };

    const res = await postJson<ApiEnvelope<FeedbackComment>>(
      "/users/community/post/comment",
      payload,
      { headers: { Authorization: `Bearer ${authToken.get()}` } }
    );

    console.debug("POST /users/community/post/comment ->", res);
    if (res?.status === false) throw new Error(res.statusMessage || "API status:false");
    return (res?.dynamicModel ?? (res as any)) as FeedbackComment;
  });
}

export async function getFeedbackComments(feedbackId: string) {
  return authed(async () => {
    const res = await getJson<ApiEnvelope<FeedbackComment[]>>(
      `/users/community/posts/comments?feedback_id=${encodeURIComponent(feedbackId)}`,
      { headers: { Authorization: `Bearer ${authToken.get()}` } }
    );
    console.debug("GET /users/community/posts/comments ->", res);
    if (res?.status === false) throw new Error(res.statusMessage || "API status:false");
    return (res?.dynamicModel ?? (res as any)) as FeedbackComment[];
  });
}
