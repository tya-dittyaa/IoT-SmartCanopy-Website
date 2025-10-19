import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import React from "react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

interface HumidityRadialProps {
  value: number | null;
}

export const HumidityRadial: React.FC<HumidityRadialProps> = ({ value }) => {
  const chartData = [{ humidity: value ?? 0, max: 100 }];

  const chartConfig = {
    humidity: {
      label: "Humidity",
      color: "hsl(178, 84%, 32%)", // teal-600
    },
    max: {
      label: "Max",
      color: "hsl(210, 40%, 92%)", // slate-200
    },
  } satisfies ChartConfig;

  return (
    <div className="w-full h-64 flex items-center justify-center">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square w-full max-w-[280px]"
      >
        <RadialBarChart
          data={chartData}
          startAngle={90}
          endAngle={-270}
          innerRadius={80}
          outerRadius={120}
        >
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) - 5}
                        className="fill-teal-600 dark:fill-teal-400 text-2xl font-bold"
                      >
                        {value !== null ? `${value}%` : "--%"}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 20}
                        className="fill-muted-foreground text-xs"
                      >
                        Range: 0-100%
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </PolarRadiusAxis>
          <RadialBar
            dataKey="max"
            fill="var(--color-max)"
            cornerRadius={10}
            className="stroke-transparent stroke-2"
          />
          <RadialBar
            dataKey="humidity"
            fill="var(--color-humidity)"
            cornerRadius={10}
            className="stroke-transparent stroke-2"
          />
        </RadialBarChart>
      </ChartContainer>
    </div>
  );
};
