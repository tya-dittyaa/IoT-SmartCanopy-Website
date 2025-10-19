import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface TemperatureAreaProps {
  data: Array<{ time: string; temp: number }>;
  latestTime?: string | undefined;
}

const chartConfig = {
  temp: { label: "Temperature (°C)", color: "#ef4444" },
} satisfies ChartConfig;

export const TemperatureArea: React.FC<TemperatureAreaProps> = ({ data }) => {
  return (
    <div className="w-full h-full">
      <ChartContainer config={{ temp: chartConfig.temp }}>
        <AreaChart data={data} margin={{ left: 12, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis yAxisId="left" domain={["dataMin - 2", "dataMax + 2"]} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Area
            yAxisId="left"
            dataKey="temp"
            name="(°C)"
            type="natural"
            fill="var(--color-temp)"
            fillOpacity={0.4}
            stroke="var(--color-temp)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

export default TemperatureArea;
