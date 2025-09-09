import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

// This component expects the real API shape: array of province totals
export type ProvinceStat = {
  province?: string;
  provinces?: string;
  totals?: number;
};

type Props = { stats: ProvinceStat[] };

export function AnalyticsDataTables({ stats }: Props) {
  const rows = Array.isArray(stats) ? stats : [];

  // Normalize fields for the table
  type Row = { province: string; totals: number };
  const tableRows: Row[] = rows.map((r) => ({
    province: (r.province ?? r.provinces ?? "Unknown") as string,
    totals: typeof r.totals === "number" ? r.totals : 0,
  }));

  // NOTE: ColumnDef<TData, TValue> needs two type args
  const columns: ColumnDef<Row, unknown>[] = [
    { accessorKey: "province", header: "Province" },
    { accessorKey: "totals", header: "Detections" },
  ];

  return (
    <div className="mt-6 grid grid-cols-1 gap-6">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Detections by Province</CardTitle>
        </CardHeader>
        <CardContent>
          {/* DataTable<TData, TValue> also needs two type args */}
          <DataTable<Row, unknown>
            columns={columns}
            data={tableRows}
            searchableColumn="province"
          />
        </CardContent>
      </Card>
    </div>
  );
}
