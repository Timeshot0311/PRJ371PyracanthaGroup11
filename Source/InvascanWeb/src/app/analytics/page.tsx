"use client";

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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocateIcon, UploadIcon } from "lucide-react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

//TODO => Cleanup code when general design is done

//EXAMPLE TIME SERIES ANALYSIS API QUERY
//https://api.inaturalist.org/v1/observations/histogram?taxon_name=pyracantha&place_id=97394&interval=month

//EXAMPLE SPECIES DISTRIBUTION API QUERY
//https://api.inaturalist.org/v1/observations/species_counts?taxon_name=pyracantha&place_id=97394

//DUMMY DATA TO GET IDEA
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

//DUMMY DATA TO GET IDEA
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
              <Input type='text' placeholder='Western Cape, South Africa' className='truncate placeholder:truncate' />
              <Button>Search</Button>
            </div>
            <div>
              <Card className='min-h-[200px] flex items-center justify-center'>
                <CardContent>Map here</CardContent>
              </Card>
            </div>
            <div>
              <Card className='border-none shadow-none'>
                <CardHeader>
                  <CardTitle>Observation statistics dummy labels</CardTitle>
                </CardHeader>
                <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='flex flex-row gap-2'>
                    <LocateIcon />
                    <div className='flex flex-col gap-2'>
                      <div>Observed On</div>
                      <div>2025-05-13</div>
                    </div>
                  </div>
                  <div className='flex flex-row gap-2'>
                    <LocateIcon />
                    <div className='flex flex-col gap-2'>
                      <div>Total Observations</div>
                      <div>15</div>
                    </div>
                  </div>
                  <div className='flex flex-row gap-2'>
                    <LocateIcon />
                    <div className='flex flex-col gap-2'>
                      <div>Positional Accuracy</div>
                      <div>9046</div>
                    </div>
                  </div>
                  <div className='flex flex-row gap-2'>
                    <LocateIcon />
                    <div className='flex flex-col gap-2'>
                      <div>Place Gues</div>
                      <div>Chapel Hill, NC, US</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Tabs defaultValue='tab-1' className='w-full'>
              <TabsList className='bg-transparent w-full'>
                <TabsTrigger
                  value='tab-1'
                  className='data-[state=active]:shadow-none data-[state=active]:border-b-black focus-visible:border-none'
                >
                  Example graph 1
                </TabsTrigger>
                <TabsTrigger
                  value='tab-2'
                  className='data-[state=active]:shadow-none data-[state=active]:border-b-black focus-visible:border-none'
                >
                  Example graph 2
                </TabsTrigger>
              </TabsList>
              <TabsContent value='tab-1'>
                <ChartContainer config={chartConfig} className='min-h-[200px] w-full'>
                  <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey='month'
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey='desktop' fill='var(--color-desktop)' radius={4} />
                    <Bar dataKey='mobile' fill='var(--color-mobile)' radius={4} />
                  </BarChart>
                </ChartContainer>
              </TabsContent>
              <TabsContent value='tab-2'>Species Distribution</TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
