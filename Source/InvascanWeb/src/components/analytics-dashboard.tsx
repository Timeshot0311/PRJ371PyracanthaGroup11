import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { analyticsQueryOptions } from "@/queries/analytics-query-options";
import { getProvinceLocations, getYearLocations, getYearMonthLocations, } from "@/services/reports";
import {
    Bar,
    BarChart,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Sector,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import za from "@/assets/za.json";

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
const COLORS = [
    "#9fa8ff",
    "#a0e3c0",
    "#ffd27f",
    "#ff9e84",
    "#a7e9f3",
    "#b8f59a",
    "#e3f57a",
    "#ffc6dd",
    "#c8bdff",
];

const monthLabel = (m: number) =>
    new Date(2000, m - 1, 1).toLocaleString(undefined, { month: "long" });

function groupBy<T, K extends string | number>(
    rows: T[],
    keyFn: (r: T) => K
) {
    const out = new Map<K, T[]>();
    for (const r of rows) {
        const k = keyFn(r);
        out.set(k, [...(out.get(k) || []), r]);
    }
    return out;
}

/** -------- KPI -------- */
const KPI = React.memo(function KPI({
                                        title,
                                        value,
                                    }: {
    title: string;
    value: number | string;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <span/>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">Updated live</p>
            </CardContent>
        </Card>
    );
});

/** -------- Province Bar -------- */
const ProvinceBar = React.memo(function ProvinceBar({
                                                        data,
                                                    }: {
    data: { name: string; value: number }[];
}) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={26}>
                <defs>
                    <linearGradient id="glassPurple" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="0%"
                            stopColor="rgba(160, 255, 192, 0.95)"
                        />
                        <stop
                            offset="100%"
                            stopColor="rgba(160, 249, 255, 0.25)"
                        />
                    </linearGradient>
                </defs>
                <XAxis dataKey="name" tickLine={false} axisLine={false}/>
                <YAxis tickLine={false} axisLine={false}/>
                <Tooltip/>
                <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                    fill="url(#glassPurple)"
                    animationBegin={200}
                    animationDuration={900}
                />
            </BarChart>
        </ResponsiveContainer>
    );
});

/** -------- Province Pie -------- */
const ProvincePie = React.memo(function ProvincePie({
                                                        data,
                                                        colors,
                                                    }: {
    data: { name: string; value: number }[];
    colors: string[];
}) {
    const [activeIndex, setActiveIndex] = React.useState(-1);

    const renderActiveSlice = React.useCallback((props: any) => {
        const {
            cx,
            cy,
            innerRadius,
            outerRadius,
            startAngle,
            endAngle,
            fill,
        } = props;
        return (
            <g>
                <defs>
                    <filter
                        id="sliceGlow"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                    >
                        <feDropShadow
                            dx="0"
                            dy="2"
                            stdDeviation="4"
                            floodColor={fill}
                            floodOpacity="0.65"
                        />
                    </filter>
                </defs>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={Math.max(0, innerRadius - 2)}
                    outerRadius={outerRadius + 10}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    filter="url(#sliceGlow)"
                />
            </g>
        );
    }, []);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    isAnimationActive
                    activeIndex={activeIndex}
                    activeShape={renderActiveSlice}
                    onMouseEnter={(_, i) => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex(-1)}
                >
                    {data.map((_, i) => (
                        <Cell
                            key={i}
                            fill={colors[i % colors.length]}
                            style={{ cursor: "pointer" }}
                        />
                    ))}
                </Pie>
                <Tooltip/>
            </PieChart>
        </ResponsiveContainer>
    );
});

/** -------- Province Map -------- */
const ProvinceMap = React.memo(function ProvinceMap({
                                                        features,
                                                        provinceTotals,
                                                        nameProp,
                                                    }: {
    features: any[];
    provinceTotals: ProvinceTotals[];
    nameProp: string;
}) {
    const maxTotals = React.useMemo(
        () => Math.max(1, ...provinceTotals.map((p) => p.totals || 0)),
        [provinceTotals]
    );

    const colorFor = React.useCallback(
        (t: number) => {
            const pct = Math.min(1, t / maxTotals);
            const base = 210;
            const sat = 60;
            const light = 92 - Math.round(pct * 35);
            return `hsl(${base} ${sat}% ${light}%)`;
        },
        [maxTotals]
    );

    return (
        <svg viewBox="0 0 260 220" className="w-full h-full">
            {features?.map((f, i) => {
                const provName = f.properties?.[nameProp] ?? "";
                const tot =
                    provinceTotals.find((p) => p.province === provName)
                        ?.totals ?? 0;
                const toXY = (lon: number, lat: number) => {
                    const minLon = 16,
                        maxLon = 33;
                    const minLat = -35,
                        maxLat = -21;
                    const x = ((lon - minLon) / (maxLon - minLon)) * 240 + 10;
                    const y = ((maxLat - lat) / (maxLat - minLat)) * 200 + 10;
                    return [x, y];
                };
                const drawPoly = (coords: any[]): string =>
                    coords
                        .map((ring) =>
                            ring
                                .map(([lon, lat]: [number, number]) =>
                                    toXY(lon, lat).join(",")
                                )
                                .join(" ")
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
    );
});

/** -------- Trend Chart -------- */
const TrendChart = React.memo(function TrendChart({
                                                      data,
                                                  }: {
    data: { name: string; value: number }[];
}) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <XAxis dataKey="name"/>
                <YAxis/>
                <Tooltip/>
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#9fa1ffff"
                    strokeWidth={2}
                    dot={false}
                    animationBegin={200}
                    animationDuration={900}
                />
            </LineChart>
        </ResponsiveContainer>
    );
});

/** -------- Place Drill-in -------- */
const PlaceDrillBar = React.memo(function PlaceDrillBar({
                                                            data,
                                                        }: {
    data: { name: string; value: number }[];
}) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={22}>
                <defs>
                    <linearGradient id="glassPurpleH" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="0%"
                            stopColor="rgba(160, 255, 211, 0.95)"
                        />
                        <stop
                            offset="100%"
                            stopColor="rgba(160, 174, 255, 0.25)"
                        />
                    </linearGradient>
                </defs>
                <XAxis dataKey="name" hide/>
                <YAxis/>
                <Tooltip/>
                <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                    fill="url(#glassPurpleH)"
                />
            </BarChart>
        </ResponsiveContainer>
    );
});

/** -------- Dashboard -------- */
export function AnalyticsDashboard() {
    const { data: provinceTotalsRaw } =
        useSuspenseQuery(analyticsQueryOptions());
    const provinceTotals: ProvinceTotals[] = Array.isArray(
        provinceTotalsRaw
    )
        ? provinceTotalsRaw
        : provinceTotalsRaw?.dynamicModel ?? [];

    const now = new Date();
    const [year, setYear] = React.useState<string>(
        String(now.getFullYear())
    );
    const [month, setMonth] = React.useState<string>(ALL);
    const [province, setProvince] = React.useState<string>(ALL);

    const provinces = provinceTotals.map((r) => r.province);
    const totalDetections = provinceTotals.reduce(
        (a, r) => a + (r.totals || 0),
        0
    );
    const provincesCovered = provinceTotals.length;
    const topProvince =
        provinceTotals
            .slice()
            .sort((a, b) => b.totals - a.totals)[0]?.province ?? "—";

    // queries
    const { data: yearLocRaw } = useQuery({
        queryKey: ["reports", "year", year],
        queryFn: async () => {
            const res = await getYearLocations(year);
            return Array.isArray(res) ? res : res?.dynamicModel ?? [];
        },
        enabled: !!year,
        staleTime: 60_000,
    });

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

    const yearLoc: LocationRow[] = Array.isArray(yearLocRaw)
        ? yearLocRaw
        : [];
    const monthLoc: LocationRow[] = Array.isArray(monthLocRaw)
        ? monthLocRaw
        : [];
    const provinceLoc: LocationRow[] = Array.isArray(provinceLocRaw)
        ? provinceLocRaw
        : [];

    // derived
    const provinceBarData = React.useMemo(
        () =>
            provinceTotals.map((r) => ({
                name: r.province,
                value: r.totals,
            })),
        [provinceTotals]
    );

    const pieData = React.useMemo(() => provinceBarData, [provinceBarData]);

    const byMonth = React.useMemo(() => {
        const arr = Array.from({ length: 12 }, (_, i) => ({
            name: monthLabel(i + 1),
            value: 0,
        }));
        for (const row of yearLoc) {
            const m = Number(row.created_at?.split("-")[1] || 0);
            if (m >= 1 && m <= 12) arr[m - 1].value++;
        }
        return arr;
    }, [yearLoc]);

    const byDay = React.useMemo(() => {
        const daysInSelMonth =
            month === ALL
                ? 31
                : new Date(Number(year), Number(month), 0).getDate();
        const arr = Array.from({ length: daysInSelMonth }, (_, i) => ({
            name: String(i + 1),
            value: 0,
        }));
        if (month !== ALL) {
            for (const row of monthLoc) {
                const [y, m, d] = row.created_at.split("-").map(Number);
                if (m === Number(month)) arr[d - 1].value++;
            }
        }
        return arr;
    }, [month, monthLoc, year]);

    const placeSeries = React.useMemo(() => {
        const byPlaceMap = groupBy(
            provinceLoc,
            (r) => r.place || "Unknown"
        );
        return Array.from(byPlaceMap.entries())
            .map(([place, arr]) => ({ name: place, value: arr.length }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 12);
    }, [provinceLoc]);

    // map setup
    type ZAFeature = {
        type: "Feature";
        properties: Record<string, any>;
        geometry: { type: "Polygon" | "MultiPolygon"; coordinates: any };
    };
    const features = (za as any).features as ZAFeature[];
    const namePropGuess = ["NAME_1", "name", "PROVINCE", "prov_name"].find(
        (k) => features?.[0]?.properties?.[k] !== undefined
    );
    const nameProp = namePropGuess ?? "name";

    return (
        <div className="space-y-6">
            {/* FILTER BAR */}
            <Card>
                <CardContent className="py-4 flex items-center gap-x-4">
                    <div>
                        <label className="text-sm mb-1 block">Year</label>
                        <Select value={year} onValueChange={setYear}>
                            <SelectTrigger>
                                <SelectValue placeholder="Year"/>
                            </SelectTrigger>
                            <SelectContent>
                                {[now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2].map(
                                    (y) => (
                                        <SelectItem value={String(y)} key={y}>
                                            {y}
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/*<div>*/}
                    {/*    <label className="text-sm mb-1 block">Month</label>*/}
                    {/*    <Select value={month} onValueChange={setMonth}>*/}
                    {/*        <SelectTrigger>*/}
                    {/*            <SelectValue placeholder="All months"/>*/}
                    {/*        </SelectTrigger>*/}
                    {/*        <SelectContent>*/}
                    {/*            <SelectItem value={ALL}>All</SelectItem>*/}
                    {/*            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (*/}
                    {/*                <SelectItem value={String(m)} key={m}>*/}
                    {/*                    {monthLabel(m)}*/}
                    {/*                </SelectItem>*/}
                    {/*            ))}*/}
                    {/*        </SelectContent>*/}
                    {/*    </Select>*/}
                    {/*</div>*/}

                    <div>
                        <label className="text-sm mb-1 block">Province</label>
                        <Select value={province} onValueChange={setProvince}>
                            <SelectTrigger>
                                <SelectValue placeholder="All provinces"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>All</SelectItem>
                                {provinces.map((p) => (
                                    <SelectItem key={p} value={p}>
                                        {p}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* KPI row */}
            <div className="grid gap-6 md:grid-cols-4">
                <KPI
                    title="Total Detections"
                    value={totalDetections.toLocaleString()}
                />
                <KPI title="Provinces Covered" value={provincesCovered}/>
                <KPI title="Top Province" value={topProvince}/>
                <KPI title="Active Users" value={0}/>
            </div>

            {/* Province bars + share pie + map */}
            <div className="grid gap-6 md:grid-cols-5">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Detections by Province</CardTitle>
                    </CardHeader>
                    <CardContent className="h-72">
                        <ProvinceBar data={provinceBarData}/>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Province Share</CardTitle>
                    </CardHeader>
                    <CardContent className="h-72">
                        <ProvincePie data={pieData} colors={COLORS}/>
                    </CardContent>
                </Card>

                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Map</CardTitle>
                    </CardHeader>
                    <CardContent className="h-72">
                        <ProvinceMap
                            features={features}
                            provinceTotals={provinceTotals}
                            nameProp={nameProp}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Trends */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Year Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="h-72">
                        <TrendChart data={byMonth}/>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {province === ALL ? "Select a province" : `Places in ${province}`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-72">
                        {province !== ALL ? (
                            <PlaceDrillBar data={placeSeries}/>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                Select a province
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
