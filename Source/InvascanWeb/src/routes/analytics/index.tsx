import { createFileRoute, redirect } from "@tanstack/react-router";
import { PageLayout } from "@/components/layouts/PageLayout";
import { PendingFallback } from "@/components/fallbacks/pending-fallback";
import * as React from "react";
import { authToken } from "@/lib/auth";

// ⬇️ Use the dashboard instead of KPIs
import { AnalyticsDashboard } from "@/components/analytics-dashboard";

export const Route = createFileRoute("/analytics/")({
  beforeLoad: () => {
    if (!authToken.get()) throw redirect({ to: "/login" });
  },
  component: AnalyticsPage,
});

export default function AnalyticsPage() {
  return (
    <PageLayout>
      <div className="my-10">
        <React.Suspense fallback={<PendingFallback />}>
          {/* ⬇️ Render new dashboard */}
          <AnalyticsDashboard />
        </React.Suspense>
      </div>
    </PageLayout>
  );
}
