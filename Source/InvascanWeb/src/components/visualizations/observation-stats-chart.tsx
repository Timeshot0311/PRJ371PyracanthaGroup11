import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Observation } from "@/lib/api";
import { CartesianGrid, XAxis, YAxis, Bar, BarChart } from "recharts";

const chartConfig = {
  count: {
    label: "Count",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function ObservationStatsChart({ chartData }: { chartData: Observation[] }) {
  return (
    <ChartContainer config={chartConfig} className='min-h-[200px] w-full'>
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey='month'
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis />
        <Bar dataKey='count' fill='var(--color-count)' radius={4} />
        <ChartTooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  );
}
