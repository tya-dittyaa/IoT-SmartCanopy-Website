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

interface HumidityAreaProps {
  data: Array<{ time: string; hum: number }>;
}

const chartConfig = {
  hum: { label: "Humidity (%)", color: "#3b82f6" },
} satisfies ChartConfig;

export const HumidityArea: React.FC<HumidityAreaProps> = ({ data }) => {
  return (
    <div className="w-full h-full">
      <ChartContainer config={{ hum: chartConfig.hum }}>
        <AreaChart data={data} margin={{ left: 12, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis yAxisId="left" domain={["dataMin - 5", "dataMax + 5"]} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Area
            yAxisId="left"
            dataKey="hum"
            name="(%)"
            type="natural"
            fill="var(--color-hum)"
            fillOpacity={0.4}
            stroke="var(--color-hum)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

export default HumidityArea;
