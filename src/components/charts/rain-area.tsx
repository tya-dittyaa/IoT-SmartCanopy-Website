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

interface RainAreaProps {
  data: Array<{ time: string; rain: number }>;
}

const chartConfig = {
  rain: { label: "Rain (1 = RAIN)", color: "#10b981" },
} satisfies ChartConfig;

export const RainArea: React.FC<RainAreaProps> = ({ data }) => {
  return (
    <div className="w-full h-full">
      <ChartContainer config={{ rain: chartConfig.rain }}>
        <AreaChart data={data} margin={{ left: 12, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis yAxisId="left" domain={[0, 1]} allowDecimals={false} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Area
            yAxisId="left"
            dataKey="rain"
            name="(1 = RAIN)"
            type="basis"
            fill="var(--color-rain, #10b981)"
            fillOpacity={0.4}
            stroke="var(--color-rain, #10b981)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

export default RainArea;
