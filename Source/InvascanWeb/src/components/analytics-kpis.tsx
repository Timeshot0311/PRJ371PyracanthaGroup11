import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSuspenseQuery } from "@tanstack/react-query";
import { analyticsQueryOptions } from "@/queries/analytics-query-options";
import { Cpu, MapPin, ScatterChart, TrendingUp } from "lucide-react";
import { AnalyticsDataTables } from "@/components/analytics-data-tables";

type ProvinceStat = {
  province?: string; // some backends use "province"
  provinces?: string; // yours might use "provinces" in some places
  totals?: number;
};

export function AnalyticsKpis() {
  const { data } = useSuspenseQuery(analyticsQueryOptions());

  // The query already unwraps to an array in analytics-query-options.ts
  const stats: ProvinceStat[] = Array.isArray(data) ? data : [];

  const getProvince = (s: ProvinceStat) =>
    s.province ?? s.provinces ?? "Unknown";
  const getTotals = (s: ProvinceStat) =>
    typeof s.totals === "number" ? s.totals : 0;

  // Safe aggregations (no "reduce on undefined" anymore)
  const totalDetections = stats.reduce((sum, s) => sum + getTotals(s), 0);
  const provincesCovered = stats.length;
  const topProvince = stats
    .slice()
    .sort((a, b) => getTotals(b) - getTotals(a))[0];

  // You don't have a live "active users" metric right now; keep a placeholder or remove the card.
  const activeUsersToday = 0;

  return (
    <div className="my-20">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <KPI
          title="Total Detections"
          value={totalDetections.toLocaleString()}
          icon={<ScatterChart className="size-4" />}
        />
        <KPI
          title="Provinces Covered"
          value={provincesCovered.toString()}
          icon={<MapPin className="size-4" />}
        />
        <KPI
          title="Top Province"
          value={topProvince ? getProvince(topProvince) : "—"}
          icon={<Cpu className="size-4" />}
        />
        <KPI
          title="Active Users"
          value={activeUsersToday.toString()}
          icon={<TrendingUp className="size-4" />}
        />
      </div>

      {/* Data table now consumes the province totals array */}
      <AnalyticsDataTables stats={stats} />
    </div>
  );
}

function KpiCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2 flex items-center justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">Updated</p>
      </CardContent>
    </Card>
  );
}

// keep the original name for your import sites
const KPI = KpiCard;
