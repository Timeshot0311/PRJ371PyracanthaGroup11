"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {UploadIcon } from "lucide-react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import ObservationChart from "@/components/visualizations/ObservationChart";
import InteractiveMap from "@/components/visualizations/InteractiveMap";
import LocationSearch from "@/components/ui/LocationSearch";

// Sample data for chart and map integration
const chartData = [
  { month: "January", count: 186, lng: 28.0473, lat: -26.2041 },
  { month: "February", count: 305, lng: 28.2293, lat: -25.7479 },
  { month: "March", count: 237, lng: 27.9067, lat: -26.1997 },
  { month: "April", count: 73, lng: 27.9824, lat: -26.1161 },
  { month: "May", count: 209, lng: 28.1743, lat: -25.7479 },
  { month: "June", count: 214, lng: 28.0467, lat: -26.1807 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

export default function HomeIndex() {
  const [focusPoint, setFocusPoint] = useState<{ lng: number; lat: number } | null>(null);

  // Handle chart bar click to update map view
  const handlePointClick = (lng: number, lat: number) => {
    setFocusPoint({ lng, lat });
  };

  // Handle location search to update map view
  const handleLocationSearch = (lng: number, lat: number) => {
    setFocusPoint({ lng, lat });
  };

  return (
    <div>
      <section className='mx-auto container py-10 max-w-3xl px-4'>
        <header className='flex items-center justify-between'>
          <Link href='/' className='text-xl font-medium'>
            Invascan
          </Link>
          <Button asChild>
            <Link href='/'>
              <UploadIcon className='mr-2 h-4 w-4' />
              Analyze image
            </Link>
          </Button>
        </header>
      </section>

      <section className='max-w-3xl mx-auto container px-4 pb-10'>
        <Card className='border-none shadow-none'>
          <CardHeader>
            <CardTitle>Pyracantha detection analytics</CardTitle>
            <CardDescription>Visualize geographic distribution and analytics for Pyracantha</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4 w-full'>
            <div className='flex flex-row gap-2'>
              <LocationSearch onSearch={handleLocationSearch} />
            </div>

            <div>
              <Card className='min-h-[400px]'>
                <CardContent>
                  <InteractiveMap points={chartData} focusPoint={focusPoint} />
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue='tab-1' className='w-full'>
              <TabsList className='bg-transparent w-full'>
                <TabsTrigger
                  value='tab-1'
                  className='data-[state=active]:shadow-none data-[state=active]:border-b-black focus-visible:border-none'
                >
                  Observation Statistics
                </TabsTrigger>
                <TabsTrigger
                  value='tab-2'
                  className='data-[state=active]:shadow-none data-[state=active]:border-b-black focus-visible:border-none'
                >
                  Distribution Graph
                </TabsTrigger>
              </TabsList>
              <TabsContent value='tab-1'>
                <ChartContainer config={chartConfig} className='min-h-[300px] w-full'>
                  <ObservationChart data={chartData} onPointClick={handlePointClick} />
                </ChartContainer>
              </TabsContent>
              <TabsContent value='tab-2'>
                <ChartContainer config={chartConfig} className='min-h-[300px] w-full'>
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" type="category" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="count" fill="var(--color-desktop)" />
                  </BarChart>
                </ChartContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
