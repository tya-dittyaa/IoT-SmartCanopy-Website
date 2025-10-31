import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import React from "react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

interface LightRadialProps {
  value: number | null;
}

export const LightRadial: React.FC<LightRadialProps> = ({ value }) => {
  const percent = value !== null ? Math.round((value / 4095) * 100) : 0;
  const chartData = [{ light: percent ?? 0, max: 100 }];

  const chartConfig = {
    light: {
      label: "Light",
      color: "hsl(42, 97%, 45%)", // amber-500-ish
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
                        className="fill-amber-600 dark:fill-amber-400 text-2xl font-bold"
                      >
                        {value !== null ? `${percent}%` : "--%"}
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
            dataKey="light"
            fill="var(--color-light)"
            cornerRadius={10}
            className="stroke-transparent stroke-2"
          />
        </RadialBarChart>
      </ChartContainer>
    </div>
  );
};

export default LightRadial;
