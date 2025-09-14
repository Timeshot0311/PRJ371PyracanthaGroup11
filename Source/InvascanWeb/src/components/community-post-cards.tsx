// src/components/community-post-cards.tsx
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp } from "lucide-react";
import dayjs from "dayjs";

import { communityAllQuery, feedbackCommentsQuery } from "@/queries/community-query-options";
import { postFeedbackComment } from "@/services/community";
import { authToken } from "@/lib/auth"; // only read on the client
import { getJson } from "@/lib/api";

type Post = {
  Id?: string;
  Comments?: string;
  Ratings?: number;
  CreatedAt?: string;

  // possible flat fields
  Username?: string;
  UserName?: string;
  username?: string;
  Name?: string;
  name?: string;
  DisplayName?: string;
  Email?: string;

  // possible nested containers with user info
  User?: any;
  Author?: any;
  CreatedBy?: any;
  Owner?: any;
  Profile?: any;

  UserId?: string;

  Province?: string;
  ProvinceName?: string;
  Location?: string;
  Tags?: string[];
};

type Comment = {
  Id?: string;
  FeedbackId?: string;
  Comments?: string;
  Ratings?: number;
  CreatedAt?: string;

  // flat
  Username?: string;
  UserName?: string;
  username?: string;
  Name?: string;
  name?: string;
  DisplayName?: string;
  Email?: string;

  // nested
  User?: any;
  Author?: any;
  CreatedBy?: any;
  Owner?: any;
  Profile?: any;

  UserId?: string;
};

type Me = {
  Id?: string;
  UserId?: string;
  Username?: string;
  UserName?: string;
  Name?: string;
  Email?: string;
  Province?: string;
};

// ---------- helpers ----------
function firstDefined<T>(...vals: (T | undefined)[]) {
  for (const v of vals) if (v !== undefined && v !== null && String(v).trim() !== "") return v as T;
  return undefined as any;
}

function extractNameLike(obj: any): string | undefined {
  if (!obj) return undefined;
  return firstDefined<string>(
    obj.Username,
    obj.UserName,
    obj.username,
    obj.DisplayName,
    obj.Name,
    obj.name,
    obj.FullName,
    obj.fullName,
    obj.Nickname,
    obj.nickname,
    obj.User?.Username,
    obj.User?.UserName,
    obj.User?.DisplayName,
    obj.User?.Name,
    obj.Author?.Username,
    obj.Author?.UserName,
    obj.Author?.DisplayName,
    obj.Author?.Name,
    obj.CreatedBy?.Username,
    obj.CreatedBy?.UserName,
    obj.CreatedBy?.DisplayName,
    obj.CreatedBy?.Name,
    obj.Owner?.Username,
    obj.Owner?.UserName,
    obj.Owner?.DisplayName,
    obj.Owner?.Name,
    obj.Profile?.Username,
    obj.Profile?.UserName,
    obj.Profile?.DisplayName,
    obj.Profile?.Name,
    obj.Email ? String(obj.Email).split("@")[0] : undefined,
    obj.User?.Email ? String(obj.User.Email).split("@")[0] : undefined
  );
}

function getNameFromAny(record: any, me?: Me): string {
  // 1) try direct/nested fields on the record
  const direct = extractNameLike(record);
  if (direct) return direct;

  // 2) if it only has UserId and that matches me, show my name
  const meId = me?.Id ?? me?.UserId;
  if (record?.UserId && meId && record.UserId === meId) {
    return (
      extractNameLike(me) ??
      (me?.Email ? String(me.Email).split("@")[0] : undefined) ??
      "Me"
    );
  }

  // 3) fallback
  return "Anonymous";
}

function getProvinceLabel(post: Post): string {
  return firstDefined(post.Province, post.ProvinceName, post.Location, "Unknown")!;
}

// ----- small helper subcomponent to render comments for a post -----
function CommentSection({ feedbackId, enabled, me }: { feedbackId: string; enabled: boolean; me?: Me }) {
  const { data, isLoading } = useQuery({
    ...feedbackCommentsQuery(feedbackId),
    enabled: enabled && !!feedbackId,
  });

  const comments: Comment[] = Array.isArray(data) ? data : [];

  if (isLoading) return <p className="text-xs text-muted-foreground">Loading comments…</p>;
  if (!comments.length) return <p className="text-xs text-muted-foreground">No comments yet.</p>;

  return (
    <div className="mt-2 space-y-2">
      {comments.map((c) => {
        const author = getNameFromAny(c, me);
        const created = c.CreatedAt ?? new Date().toISOString();

        return (
          <div key={c.Id ?? `${feedbackId}-${created}-${Math.random()}`} className="flex items-start gap-2">
            <Avatar className="size-6">
              <AvatarImage src="" />
              <AvatarFallback className="text-[10px]">
                {author.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{author}</span>
                <span>·</span>
                <span>{dayjs(created).format("YYYY-MM-DD")}</span>
              </div>
              <div className="text-sm whitespace-pre-wrap">{c.Comments ?? ""}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CommunityPostCards() {
  // run only after first client render
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => setReady(true), []);

  // read token only in the browser
  const token = React.useMemo(
    () => (typeof window !== "undefined" ? authToken.get() : null),
    [ready]
  );

  const qc = useQueryClient();

  // Fetch the feed (client only, and only if signed in)
  const { data, isLoading } = useQuery({
    ...communityAllQuery(),
    enabled: ready && !!token,
  });

  // Fetch MY profile (so if posts only return UserId, we can at least label my own posts)
  const { data: me } = useQuery({
    queryKey: ["me"],
    enabled: ready && !!token,
    queryFn: async (): Promise<Me> => {
      const res = await getJson<any>("/users/", {
        headers: { Authorization: `Bearer ${authToken.get()}` },
      });
      const model = (res?.dynamicModel ?? res) as any;
      return model ?? {};
    },
    staleTime: 5 * 60_000,
  });

  const posts: Post[] = Array.isArray(data) ? data : [];

  // One-time debug to see the exact shape coming back
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production" && posts.length > 0) {
      // eslint-disable-next-line no-console
      console.debug("Community posts sample:", posts[0]);
    }
  }, [posts]);

  const [quickReply, setQuickReply] = React.useState<Record<string, string>>({});
  const commentMut = useMutation({
    mutationFn: async (p: { FeedbackId: string; Comments: string }) =>
      postFeedbackComment({ FeedbackId: p.FeedbackId, Comments: p.Comments, Ratings: 0 }),
    onSuccess(_, vars) {
      // refresh feed and that post’s comments; clear the input
      qc.invalidateQueries({ queryKey: ["community", "all"] });
      qc.invalidateQueries({ queryKey: ["community", "comments", vars.FeedbackId] });
      setQuickReply((m) => ({ ...m, [vars.FeedbackId]: "" }));
    },
  });

  // simple loading/empty states
  if (!ready || isLoading) {
    return <p className="text-muted-foreground">Loading community…</p>;
  }
  if (!token) {
    return <p className="text-muted-foreground">Please sign in to view the community feed.</p>;
  }

  return (
    <>
      {posts.length > 0 ? (
        posts.map((post) => {
          const id = String(post.Id ?? "");
          const author = getNameFromAny(post, me);
          const where = getProvinceLabel(post);
          const created = post.CreatedAt ?? new Date().toISOString();
          const content = post.Comments ?? "";
          const tags =
            Array.isArray(post.Tags) && post.Tags.length
              ? post.Tags
              : (content.match(/#\w+/g) ?? []).map((t) => t.replace("#", ""));
          const likes = Math.max(0, Number(post.Ratings ?? 0));

          return (
            <Card key={id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-x-4">
                  <Avatar className="size-5">
                    <AvatarImage src="" />
                    <AvatarFallback>{author.slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-y-1">
                    <CardTitle className="text-base">{author}</CardTitle>
                    <span className="text-xs text-muted-foreground">{where}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {dayjs(created).format("YYYY-MM-DD")}
                </span>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* --- Comments for this post --- */}
                <CommentSection feedbackId={id} enabled={ready && !!token} me={me} />

                {/* --- Quick reply composer --- */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    className="h-8 rounded border px-2 text-sm bg-background flex-1"
                    placeholder="Reply…"
                    value={quickReply[id] ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setQuickReply((m) => ({ ...m, [id]: e.target.value }))
                    }
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex items-center gap-1"
                    disabled={!id || !quickReply[id] || commentMut.isPending}
                    onClick={() =>
                      commentMut.mutate({ FeedbackId: id, Comments: quickReply[id] ?? "" })
                    }
                  >
                    <MessageSquare className="size-4" />
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <p className="text-muted-foreground">No posts found.</p>
      )}
    </>
  );
}
