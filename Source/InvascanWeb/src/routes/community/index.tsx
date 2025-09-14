import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layouts/PageLayout";
import { CommunityPosts } from "@/components/community-posts.tsx";

export const Route = createFileRoute("/community/")({
    component: CommunityPage,
});

export default function CommunityPage() {
    return (
        <PageLayout>
            <div className="my-20">
                <CommunityPosts/>
            </div>
        </PageLayout>
    );
}
