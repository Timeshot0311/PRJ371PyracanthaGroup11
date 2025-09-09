import { createFileRoute, redirect } from "@tanstack/react-router";
import { PageLayout } from "@/components/layouts/PageLayout";
import { PendingFallback } from "@/components/fallbacks/pending-fallback";
import * as React from "react";

import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { authToken } from "@/lib/auth.ts";

export const Route = createFileRoute("/analytics/")({
    beforeLoad: () => {
        if (!authToken.get()) {
            throw redirect({ to: "/login" });
        }
    },
    component: AnalyticsPage,
});

export default function AnalyticsPage() {
    return (
        <PageLayout>
            <div className="my-10">
                <React.Suspense fallback={<PendingFallback/>}>
                    <AnalyticsDashboard/>
                </React.Suspense>
            </div>
        </PageLayout>
    );
}
