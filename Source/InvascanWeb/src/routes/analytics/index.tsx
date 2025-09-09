import { createFileRoute, redirect } from "@tanstack/react-router";
import { PageLayout } from "@/components/layouts/PageLayout";
import { AnalyticsKpis } from "@/components/analytics-kpis";
import * as React from "react";
import { PendingFallback } from "@/components/fallbacks/pending-fallback";
import { authToken } from "@/lib/auth";

export const Route = createFileRoute("/analytics/")({
  // hard gate: if there's no token, don't even render this route
  beforeLoad: () => {
    const token = authToken.get();
    if (!token) {
      throw redirect({ to: "/login" });
    }
  },
  component: AnalyticsPage,
});

export default function AnalyticsPage() {
  return (
    <PageLayout>
      <div className="my-20">
        <React.Suspense fallback={<PendingFallback />}>
          <AnalyticsKpis />
        </React.Suspense>
      </div>
    </PageLayout>
  );
}
