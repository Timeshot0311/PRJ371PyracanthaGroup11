import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAnalytics, type DatasetSummary, type ActivityLog } from "@/server/functions/get-analytics";
import { PageLayout } from "@/components/layouts/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { TrendingUp, ScatterChart, Cpu, MapPin } from "lucide-react";

export const Route = createFileRoute("/analytics/")({
  component: AnalyticsPage,
});

export default function AnalyticsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await getAnalytics();
      return res.data;
    },
  });

  const datasetColumns: ColumnDef<DatasetSummary>[] = [
    { accessorKey: "species", header: "Species" },
    { accessorKey: "images", header: "Images" },
    { accessorKey: "provinces", header: "Provinces" },
    { accessorKey: "lastUpdated", header: "Last updated" },
  ];

  const activityColumns: ColumnDef<ActivityLog>[] = [
    { accessorKey: "user", header: "User" },
    { accessorKey: "action", header: "Action" },
    { accessorKey: "target", header: "Target" },
    { accessorKey: "timestamp", header: "Time" },
  ];

  const kpi = {
    totalImages: data?.dataset?.reduce((acc: any, d: { images: any; }) => acc + d.images, 0) ?? 0,
    uniqueSpecies: data?.dataset?.length ?? 0,
    provinces: Math.max(...(data?.dataset?.map((d: { provinces: any; }) => d.provinces) ?? [0])),
    activeUsersToday: 87,
  };

  return (
    <PageLayout>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <KPI title="Total Images" value={kpi.totalImages.toLocaleString()} icon={<ScatterChart className="h-4 w-4" />} />
        <KPI title="Unique Species" value={kpi.uniqueSpecies} icon={<Cpu className="h-4 w-4" />} />
        <KPI title="Provinces Covered" value={kpi.provinces} icon={<MapPin className="h-4 w-4" />} />
        <KPI title="Active Users" value={kpi.activeUsersToday} icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader><CardTitle>Dataset Summary</CardTitle></CardHeader>
          <CardContent>
            <DataTable columns={datasetColumns} data={data?.dataset ?? []} searchableColumn={"species"} />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <DataTable columns={activityColumns} data={data?.activity ?? []} searchableColumn={"user"} />
          </CardContent>
        </Card>
      </div>

      {isLoading ? <p className="mt-4 text-sm text-muted-foreground">Loading analytics...</p> : null}
      {isError ? <p className="mt-4 text-sm text-destructive">Failed to load analytics.</p> : null}
    </PageLayout>
  );
}

function KPI({ title, value, icon }: { title: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">Updated live</p>
      </CardContent>
    </Card>
  );
}
