"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LocationSearch from "@/components/ui/LocationSearch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InteractiveMap from "@/components/visualizations/InteractiveMap";
import ObservationStatsChart from "@/components/visualizations/observation-stats-chart";
import ObservationChart from "@/components/visualizations/ObservationChart";
import { fetchObservations, Observation } from "@/lib/api";
import { UploadIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomeIndex() {
  const [focusPoint, setFocusPoint] = useState<{ lng: number; lat: number } | null>(null);
  const [chartData, setChartData] = useState<Observation[]>([]);

  // Fetch iNaturalist data on component mount
  useEffect(() => {
    async function loadObservations() {
      const data = await fetchObservations(54053, 6986); // Taxon ID and Place ID
      setChartData(data); // Use the chartData state directly
    }
    loadObservations();
  }, []);

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
          <Button variant='secondary' asChild>
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
            <CardTitle>Pyracantha Detection Analytics</CardTitle>
            <CardDescription>
              Visualize geographic distribution and analytics for Pyracantha
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-6 w-full'>
            <div className='flex flex-row gap-2'>
              <LocationSearch onSearch={handleLocationSearch} />
            </div>

            <div>
              <Card className='min-h-[400px] p-0 border-none shadow-none'>
                <CardContent className='h-[500px] px-0'>
                  <div className='relative w-full h-full'>
                    <InteractiveMap points={chartData} focusPoint={focusPoint} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue='observation-statistics' className='w-full'>
              <TabsList className='bg-transparent w-full'>
                <TabsTrigger value='observation-statistics'>Observation Statistics</TabsTrigger>
                <TabsTrigger value='distribution-graph'>Distribution Graph</TabsTrigger>
              </TabsList>
              <TabsContent value='observation-statistics' className='mt-10'>
                <ObservationStatsChart chartData={chartData} />
              </TabsContent>
              <TabsContent value='distribution-graph' className='mt-10'>
                <ObservationChart data={chartData} onPointClick={handlePointClick} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
