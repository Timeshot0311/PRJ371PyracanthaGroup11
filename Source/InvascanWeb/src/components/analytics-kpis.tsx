import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { useSuspenseQuery } from "@tanstack/react-query";
import { analyticsQueryOptions } from "@/queries/analytics-query-options.ts";
import { AnalyticsDataTables } from "@/components/analytics-data-tables.tsx";
import { ReactNode } from "react";
import { Cpu, MapPin, ScatterChart, TrendingUp } from "lucide-react";

export function AnalyticsKpis() {
    const { data: analytics } = useSuspenseQuery(analyticsQueryOptions());
    
    const kpi = {
        totalImages: analytics.dataset.reduce((acc: any, d: { images: any; }) => acc + d.images, 0) ?? 0,
        uniqueSpecies: analytics.dataset.length ?? 0,
        provinces: Math.max(...(analytics.dataset.map((d: { provinces: any; }) => d.provinces) ?? [0])),
        activeUsersToday: 87,
    };

    return (
        <div className="my-20">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <KPI title="Total Images" value={kpi.totalImages.toLocaleString()}
                     icon={<ScatterChart className="size-4"/>}/>
                <KPI title="Unique Species" value={kpi.uniqueSpecies} icon={<Cpu className="size-4"/>}/>
                <KPI title="Provinces Covered" value={kpi.provinces} icon={<MapPin className="size-4"/>}/>
                <KPI title="Active Users" value={kpi.activeUsersToday} icon={<TrendingUp className="size-4"/>}/>
            </div>
            <AnalyticsDataTables dataset={analytics.dataset} activity={analytics.activity}/>
        </div>
    );
}

function KPI({ title, value, icon }: { title: string; value: number | string; icon?: ReactNode }) {
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