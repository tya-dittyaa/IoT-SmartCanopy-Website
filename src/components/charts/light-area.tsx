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

interface LightAreaProps {
  data: Array<{ time: string; light: number }>;
}

const chartConfig = {
  light: { label: "Light Intensity", color: "#f59e0b" },
} satisfies ChartConfig;

export const LightArea: React.FC<LightAreaProps> = ({ data }) => {
  return (
    <div className="w-full h-full">
      <ChartContainer config={{ light: chartConfig.light }}>
        <AreaChart data={data} margin={{ left: 12, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis yAxisId="left" allowDecimals={false} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Area
            yAxisId="left"
            dataKey="light"
            name="Light"
            type="basis"
            fill="var(--color-light, #f59e0b)"
            fillOpacity={0.4}
            stroke="var(--color-light, #f59e0b)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

export default LightArea;
