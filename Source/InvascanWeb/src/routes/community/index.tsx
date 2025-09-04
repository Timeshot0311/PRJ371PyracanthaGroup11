import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCommunityFeed, type CommunityPost } from "@/server/functions/get-community";
import { PageLayout } from "@/components/layouts/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, MessageSquare, Plus } from "lucide-react";
import * as React from "react";

export const Route = createFileRoute("/community/")({
  component: CommunityPage,
});

function PostCard({ post }: { post: CommunityPost }) {
  const initials = post.author
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.avatar || ""} alt={post.author} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <CardTitle className="text-base">{post.author}</CardTitle>
          <span className="text-xs text-muted-foreground">
            {new Date(post.createdAt).toLocaleString()} • {post.location || "Unknown"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed">{post.content}</p>
        <div className="flex flex-wrap gap-1">
          {post.tags.map((t) => (
            <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button size="sm" variant="ghost" className="gap-1">
            <ThumbsUp className="h-4 w-4" /> {post.likes}
          </Button>
          <Button size="sm" variant="ghost" className="gap-1">
            <MessageSquare className="h-4 w-4" /> {post.comments}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Composer() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Share an update</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Input placeholder="What's happening in your area?" />
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="outline">#water-hyacinth</Badge>
            <Badge variant="outline">#id-help</Badge>
          </div>
          <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Post</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CommunityPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["community", "feed"],
    queryFn: async () => {
      const res = await getCommunityFeed();
      return res.data;
    },
  });

  return (
    <PageLayout>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Composer />
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading feed...</div>
          ) : isError ? (
            <div className="text-sm text-destructive">Failed to load feed.</div>
          ) : (
            data?.feed?.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Community</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span>Members</span><span className="font-semibold">1,248</span></div>
              <div className="flex items-center justify-between"><span>Online</span><span className="font-semibold text-green-600">87</span></div>
              <div className="flex items-center justify-between"><span>Posts today</span><span className="font-semibold">32</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Popular tags</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {["water-hyacinth","black-wattle","kzn","id-help","removal"].map(t => (
                <Badge key={t} variant="secondary">#{t}</Badge>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageLayout>
  );
}
