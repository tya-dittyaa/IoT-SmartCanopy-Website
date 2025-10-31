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

interface ServoAreaProps {
  data: Array<{ time: string; servo: number }>;
}

const chartConfig = {
  servo: { label: "Servo (1 = OPEN)", color: "#8b5cf6" },
} satisfies ChartConfig;

export const ServoArea: React.FC<ServoAreaProps> = ({ data }) => {
  return (
    <div className="w-full h-full">
      <ChartContainer config={{ servo: chartConfig.servo }}>
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
            dataKey="servo"
            name="(1 = OPEN)"
            type="basis"
            fill="var(--color-servo, #8b5cf6)"
            fillOpacity={0.4}
            stroke="var(--color-servo, #8b5cf6)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

export default ServoArea;
