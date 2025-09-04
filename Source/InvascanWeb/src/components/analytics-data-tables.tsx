import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { DataTable } from "@/components/shared/DataTable.tsx";
import { ColumnDef } from "@tanstack/react-table";
import { ActivityLog, DatasetSummary } from "@/server/functions/get-analytics.tsx";

type AnalyticsTableProps = {
    dataset: DatasetSummary[];
    activity: ActivityLog[]
}

export function AnalyticsDataTables(props: AnalyticsTableProps) {
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

    return (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="col-span-1">
                <CardHeader><CardTitle>Dataset Summary</CardTitle></CardHeader>
                <CardContent>
                    <DataTable columns={datasetColumns} data={props.dataset ?? []} searchableColumn={"species"}/>
                </CardContent>
            </Card>
            <Card className="col-span-1">
                <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
                <CardContent>
                    <DataTable columns={activityColumns} data={props.activity ?? []} searchableColumn={"user"}/>
                </CardContent>
            </Card>
        </div>
    );
}