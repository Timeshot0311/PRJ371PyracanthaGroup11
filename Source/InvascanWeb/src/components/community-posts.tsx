import { CommunityComposer } from "@/components/community-composer.tsx";
import { CommunityPostCards } from "@/components/community-post-cards.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Suspense } from "react";
import { PendingFallback } from "@/components/fallbacks/pending-fallback.tsx";

export function CommunityPosts() {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
                <CommunityComposer/>
                <Suspense fallback={<PendingFallback/>}>
                    <CommunityPostCards/>
                </Suspense>
            </div>
            <aside className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Community</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center justify-between"><span>Members</span><span
                            className="font-semibold">1,248</span></div>
                        <div className="flex items-center justify-between"><span>Online</span><span
                            className="font-semibold text-green-600">87</span></div>
                        <div className="flex items-center justify-between"><span>Posts today</span><span
                            className="font-semibold">32</span></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Popular tags</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {["water-hyacinth", "black-wattle", "kzn", "id-help", "removal"].map(t => (
                            <Badge key={t} variant="secondary">#{t}</Badge>
                        ))}
                    </CardContent>
                </Card>
            </aside>
        </div>
    );
}