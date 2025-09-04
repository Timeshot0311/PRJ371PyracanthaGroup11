import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { MessageSquare, ThumbsUp } from "lucide-react";
import dayjs from "dayjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { useSuspenseQuery } from "@tanstack/react-query";
import { communityPostsQueryOptions } from "@/queries/community-posts-query-options.ts";

export function CommunityPostCards() {
    const { data: posts } = useSuspenseQuery(communityPostsQueryOptions());

    return (
        <>
            {posts.feed.length > 0 ? (
                posts.feed.map((post) => (
                    <Card className="hover:shadow-md transition-shadow" key={post.id}>
                        <CardHeader className="flex items-center justify-between">
                            <div className="flex items-center gap-x-4">
                                <Avatar className="size-5">
                                    <AvatarImage src={post.avatar}/>
                                    <AvatarFallback>{post.author[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-y-1">
                                    <CardTitle className="text-base">{post.author}</CardTitle>
                                    <span className="text-xs text-muted-foreground">{post.location || "Unknown"}</span>
                                </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {dayjs(post.createdAt).format("YYYY-MM-DD")}
                            </span>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm leading-relaxed">{post.content}</p>
                            <div className="flex flex-wrap gap-1">
                                {post.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                                ))}
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <Button size="sm" variant="ghost" className="flex items-center gap-1">
                                    <ThumbsUp className="size-4"/>
                                    {post.likes}
                                </Button>
                                <Button size="sm" variant="ghost" className="flex items-center gap-1">
                                    <MessageSquare className="size-4"/>
                                    {post.comments}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <p className="text-muted-foreground">No posts found.</p>
            )}
        </>
    );
}