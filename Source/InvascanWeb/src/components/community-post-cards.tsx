// src/components/community-post-cards.tsx
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp } from "lucide-react";
import dayjs from "dayjs";

import { communityAllQuery } from "@/queries/community-query-options";
import { postFeedbackComment } from "@/services/community";
import { authToken } from "@/lib/auth"; // we only read this on the client

type Post = {
  Id?: string;
  Comments?: string;
  Ratings?: number;
  CreatedAt?: string;
  UserName?: string;
  Province?: string;
  Tags?: string[];
};

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

  const { data, isLoading } = useQuery({
    ...communityAllQuery(),
    // critical: do NOT run on the server, and don't run without a token
    enabled: ready && !!token,
  });

  const posts: Post[] = Array.isArray(data) ? data : [];

  const [quickReply, setQuickReply] = React.useState<Record<string, string>>({});
  const commentMut = useMutation({
    mutationFn: async (p: { FeedbackId: string; Comments: string }) =>
      postFeedbackComment({ FeedbackId: p.FeedbackId, Comments: p.Comments, Ratings: 0 }),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ["community", "all"] });
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
          const author = post.UserName ?? "Anonymous";
          const where = post.Province ?? "Unknown";
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

                <div className="flex items-center gap-3 pt-2">
                  <Button size="sm" variant="ghost" className="flex items-center gap-1" disabled>
                    <ThumbsUp className="size-4" />
                    {likes}
                  </Button>

                  <div className="flex items-center gap-2">
                    <input
                      className="h-8 rounded border px-2 text-sm bg-background"
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
