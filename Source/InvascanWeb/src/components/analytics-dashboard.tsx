import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { analyticsQueryOptions } from "@/queries/analytics-query-options";
import {
  getYearLocations,
  getYearMonthLocations,
  getProvinceLocations,
} from "@/services/reports";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import za from "@/assets/za.json"; // South Africa provinces GeoJSON (FeatureCollection)

// --- types from your APIs ---
type ProvinceTotals = { province: string; totals: number };
type LocationRow = {
  id: string;
  province: string;
  place: string;
  latitude: number;
  longitude: number;
  created_at: string; // "YYYY-MM-DD"
};

// --- constants ---
const ALL = "ALL";
const COLORS = ["#9fa8ff", "#a0e3c0", "#ffd27f", "#ff9e84", "#a7e9f3", "#b8f59a", "#e3f57a", "#ffc6dd", "#c8bdff"];

/** small helpers */
const monthLabel = (m: number) =>
  new Date(2000, m - 1, 1).toLocaleString(undefined, { month: "long" });

function groupBy<T, K extends string | number>(rows: T[], keyFn: (r: T) => K) {
  const out = new Map<K, T[]>();
  for (const r of rows) {
    const k = keyFn(r);
    out.set(k, [...(out.get(k) || []), r]);
  }
  return out;
}

export function AnalyticsDashboard() {
  // 1) province totals (from /api/reports/all_province via analyticsQueryOptions)
  const { data: provinceTotalsRaw } = useSuspenseQuery(analyticsQueryOptions());
  const provinceTotals: ProvinceTotals[] = Array.isArray(provinceTotalsRaw)
    ? provinceTotalsRaw
    : provinceTotalsRaw?.dynamicModel ?? [];

  // 2) filters
  const now = new Date();
  const [year, setYear] = React.useState<string>(String(now.getFullYear()));
  const [month, setMonth] = React.useState<string>(ALL); // ALL = 12 months
  const [province, setProvince] = React.useState<string>(ALL); // ALL = no drill

  // 3) derived lists + KPIs
  const provinces = provinceTotals.map((r) => r.province);
  const totalDetections = provinceTotals.reduce((a, r) => a + (r.totals || 0), 0);
  const provincesCovered = provinceTotals.length;
  const topProvince = provinceTotals.slice().sort((a, b) => b.totals - a.totals)[0]?.province ?? "—";

  // 4) queries for detailed panels
  // year locations: we’ll make a monthly trend from this (Jan..Dec)
  const { data: yearLocRaw } = useQuery({
    queryKey: ["reports", "year", year],
    queryFn: async () => {
      const res = await getYearLocations(year);
      return Array.isArray(res) ? res : res?.dynamicModel ?? [];
    },
    enabled: !!year,
    staleTime: 60_000,
  });

  // year+month locations: show daily trend for selected month
  const { data: monthLocRaw } = useQuery({
    queryKey: ["reports", "year-month", year, month],
    queryFn: async () => {
      if (month === ALL) return [];
      const res = await getYearMonthLocations(year, month);
      return Array.isArray(res) ? res : res?.dynamicModel ?? [];
    },
    enabled: !!year && month !== ALL,
    staleTime: 60_000,
  });

  // province drill-in: list of locations for the province
  const { data: provinceLocRaw } = useQuery({
    queryKey: ["reports", "province-locations", province],
    queryFn: async () => {
      if (province === ALL) return [];
      const res = await getProvinceLocations(province);
      return Array.isArray(res) ? res : res?.dynamicModel ?? [];
    },
    enabled: province !== ALL,
    staleTime: 60_000,
  });

  const yearLoc: LocationRow[] = Array.isArray(yearLocRaw) ? yearLocRaw : [];
  const monthLoc: LocationRow[] = Array.isArray(monthLocRaw) ? monthLocRaw : [];
  const provinceLoc: LocationRow[] = Array.isArray(provinceLocRaw) ? provinceLocRaw : [];

  // 5) chart series
  // Province bars (fancy vertical gradient)
  const provinceBarData = provinceTotals.map((r) => ({ name: r.province, value: r.totals }));

  // Province share pie with hover “pop”
  const [activePieIndex, setActivePieIndex] = React.useState<number>(-1);
  const pieData = provinceBarData;

  // Monthly trend from /year: count per month 1..12
  const byMonth = Array.from({ length: 12 }, (_, i) => i + 1).map((m) => ({
    name: monthLabel(m),
    value: 0,
  }));
  for (const row of yearLoc) {
    const m = Number(row.created_at?.split("-")[1] || 0);
    if (m >= 1 && m <= 12) byMonth[m - 1].value++;
  }

  // Daily trend for selected month (1..31)
  const daysInSelMonth =
    month === ALL ? 31 : new Date(Number(year), Number(month), 0).getDate();
  const byDay = Array.from({ length: daysInSelMonth }, (_, i) => i + 1).map((d) => ({
    name: String(d),
    value: 0,
  }));
  if (month !== ALL) {
    for (const row of monthLoc) {
      const [y, m, d] = row.created_at.split("-").map(Number);
      if (m === Number(month)) byDay[d - 1].value++;
    }
  }

  // Province drill-in: top places within that province
  const byPlaceMap = groupBy(provinceLoc, (r) => r.place || "Unknown");
  const placeSeries = Array.from(byPlaceMap.entries())
    .map(([place, arr]) => ({ name: place, value: arr.length }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 12);

  // --- Map coloring: join totals to geojson by province name ---
  // Expecting each feature.properties.NAME_1 (or similar) matches the string in provinceTotals.
  // If your property key differs, adjust nameProp below.
  type ZAFeature = {
    type: "Feature";
    properties: Record<string, any>;
    geometry: { type: "Polygon" | "MultiPolygon"; coordinates: any };
  };
  const features = (za as any).features as ZAFeature[];
  const namePropGuess = ["NAME_1", "name", "PROVINCE", "prov_name"].find((k) =>
    features?.[0]?.properties?.[k] !== undefined,
  );
  const nameProp = namePropGuess ?? "name";

  const maxTotals = Math.max(1, ...provinceTotals.map((p) => p.totals || 0));
  const colorFor = (t: number) => {
    // soft purple scale, 0 -> very light, max -> deeper
    const pct = Math.min(1, t / maxTotals);
    const base = 210; // hue-ish
    const sat = 60;
    const light = 92 - Math.round(pct * 35);
    return `hsl(${base} ${sat}% ${light}%)`;
  };

  return (
    <div className="space-y-6">
      {/* FILTER BAR */}
      <Card>
        <CardContent className="py-4 grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-sm mb-1 block">Year</label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent>
                {[now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2].map((y) => (
                  <SelectItem value={String(y)} key={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm mb-1 block">Month</label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger><SelectValue placeholder="All months" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All</SelectItem>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem value={String(m)} key={m}>{monthLabel(m)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm mb-1 block">Province</label>
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger><SelectValue placeholder="All provinces" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All</SelectItem>
                {provinces.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPI row */}
      <div className="grid gap-6 md:grid-cols-4">
        <KPI title="Total Detections" value={totalDetections.toLocaleString()} />
        <KPI title="Provinces Covered" value={provincesCovered} />
        <KPI title="Top Province" value={topProvince} />
        <KPI title="Active Users" value={0} /> {/* hook up when you have it */}
      </div>

      {/* Province bars + share pie + map */}
      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Detections by Province</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={provinceBarData} barSize={26}>
                <defs>
                  <linearGradient id="glassPurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(160, 174, 255, 0.95)" />
                    <stop offset="100%" stopColor="rgba(160, 174, 255, 0.25)" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                  fill="url(#glassPurple)"
                  animationBegin={200}
                  animationDuration={900}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Province Share</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  onMouseEnter={(_, i) => setActivePieIndex(i)}
                  onMouseLeave={() => setActivePieIndex(-1)}
                  isAnimationActive
                >
                  {pieData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                      style={{ transition: "transform 160ms ease" }}
                      // scale up the active slice (hover “pop”)
                      transform={i === activePieIndex ? "scale(1.06)" : "scale(1.0)"}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader><CardTitle>Map</CardTitle></CardHeader>
          <CardContent className="h-72">
            <svg viewBox="0 0 260 220" className="w-full h-full">
              {features?.map((f, i) => {
                const provName = f.properties?.[nameProp] ?? "";
                const tot = provinceTotals.find((p) => p.province === provName)?.totals ?? 0;
                // simple path renderer (assumes ZA JSON already projected to lon/lat degrees around SA range)
                // We’ll do a super-lightweight fit transform: normalize lon[-35..35], lat[-35..-20] to svg box.
                // (If your JSON uses a different bbox, tweak these bounds)
                const toXY = (lon: number, lat: number) => {
                  const minLon = 16, maxLon = 33;  // SA approx
                  const minLat = -35, maxLat = -21;
                  const x = ((lon - minLon) / (maxLon - minLon)) * 240 + 10;
                  const y = ((maxLat - lat) / (maxLat - minLat)) * 200 + 10;
                  return [x, y];
                };

                const drawPoly = (coords: any[]): string =>
                  coords
                    .map((ring) =>
                      ring
                        .map(([lon, lat]: [number, number]) => toXY(lon, lat).join(","))
                        .join(" "),
                    )
                    .map((ringStr) => `M ${ringStr} Z`)
                    .join(" ");

                const d =
                  f.geometry.type === "Polygon"
                    ? drawPoly(f.geometry.coordinates as any[])
                    : (f.geometry.coordinates as any[][][]).map(drawPoly).join(" ");

                return (
                  <path
                    key={i}
                    d={d}
                    fill={colorFor(tot)}
                    stroke="rgba(0,0,0,0.15)"
                    strokeWidth={0.6}
                  />
                );
              })}
            </svg>
          </CardContent>
        </Card>
      </div>

      {/* Trends + Drill-in */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {month !== ALL
                ? `Detections for ${monthLabel(Number(month))} ${year}`
                : `Monthly Trend (${year})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={month === ALL ? byMonth : byDay}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#9fa8ff"
                  strokeWidth={2}
                  dot={false}
                  animationBegin={200}
                  animationDuration={900}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {province !== ALL ? `Top places in ${province}` : "Pick a province to drill in"}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={province !== ALL ? placeSeries : []} barSize={22}>
                <defs>
                  <linearGradient id="glassPurpleH" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(160, 174, 255, 0.95)" />
                    <stop offset="100%" stopColor="rgba(160, 174, 255, 0.25)" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="url(#glassPurpleH)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** simple KPI card */
function KPI({ title, value }: { title: string; value: number | string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">Updated live</p>
      </CardContent>
    </Card>
  );
}
