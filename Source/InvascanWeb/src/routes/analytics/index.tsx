import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layouts/PageLayout";
import { AnalyticsKpis } from "@/components/analytics-kpis.tsx";
import { Suspense } from "react";
import { PendingFallback } from "@/components/fallbacks/pending-fallback.tsx";

export const Route = createFileRoute("/analytics/")({
    component: AnalyticsPage,
});

export default function AnalyticsPage() {
    return (
        <PageLayout>
            <div className="my-20">
                <Suspense fallback={<PendingFallback/>}>
                    <AnalyticsKpis/>
                </Suspense>
            </div>
        </PageLayout>
    );
}


