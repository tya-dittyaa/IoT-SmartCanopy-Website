"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const description = "Graph monitoring for Temperature and Humidity";

const tempData = [
  { time: "10:00", temp: 22 },
  { time: "10:05", temp: 23 },
  { time: "10:10", temp: 23.5 },
  { time: "10:15", temp: 24 },
  { time: "10:20", temp: 24.3 },
  { time: "10:25", temp: 24.1 },
];

const humidityData = [
  { time: "10:00", hum: 55 },
  { time: "10:05", hum: 56 },
  { time: "10:10", hum: 57 },
  { time: "10:15", hum: 56.5 },
  { time: "10:20", hum: 56 },
  { time: "10:25", hum: 55.8 },
];

const chartConfig = {
  temp: { label: "Temperature (°C)", color: "#ef4444" },
  hum: { label: "Humidity (%)", color: "#3b82f6" },
} satisfies ChartConfig;

export default function GraphMonitoring() {
  const [selectedRange, setSelectedRange] = useState<
    "15m" | "30m" | "1h" | "6h" | "1d" | "7d"
  >("15m");

  const rangeToPoints = useMemo<Record<string, number>>(
    () => ({
      "15m": 3,
      "30m": 4,
      "1h": 6,
      "6h": tempData.length,
      "1d": tempData.length,
      "7d": tempData.length,
    }),
    []
  );

  const filteredTempData = useMemo(() => {
    const count = rangeToPoints[selectedRange] ?? tempData.length;
    return tempData.slice(Math.max(0, tempData.length - count));
  }, [selectedRange, rangeToPoints]);

  const filteredHumidityData = useMemo(() => {
    const count = rangeToPoints[selectedRange] ?? humidityData.length;
    return humidityData.slice(Math.max(0, humidityData.length - count));
  }, [selectedRange, rangeToPoints]);

  const latestTemp =
    filteredTempData[filteredTempData.length - 1] ??
    tempData[tempData.length - 1];
  const latestHum =
    filteredHumidityData[filteredHumidityData.length - 1] ??
    humidityData[humidityData.length - 1];

  // Available range options for the tabs (typed)
  const ranges = ["15m", "30m", "1h", "6h", "1d", "7d"] as const;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Graph Monitoring</h2>
        <p className="text-muted-foreground">
          Temperature & Humidity example charts
        </p>
      </div>

      {/* Global time-range tabs that affect all three charts */}
      <div className="flex items-center justify-start">
        <Tabs
          defaultValue="15m"
          value={selectedRange}
          onValueChange={(v: string) =>
            setSelectedRange(v as "15m" | "30m" | "1h" | "6h" | "1d" | "7d")
          }
          className="w-[520px]"
        >
          <TabsList className="gap-2 p-1">
            {ranges.map((r) => (
              <TabsTrigger key={r} value={r} className="px-3 py-1 text-base">
                {r}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Temperature Card */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Temperature</CardTitle>
              <CardDescription>DHT11 / Example data</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ temp: chartConfig.temp }}>
              <AreaChart
                data={filteredTempData}
                margin={{ left: 12, right: 12 }}
              >
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
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-center gap-2 text-sm">
              <div className="flex-1 text-sm text-muted-foreground">
                Last reading at {latestTemp.time}
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Humidity Card */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Humidity</CardTitle>
              <CardDescription>DHT11 / Example data</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ hum: chartConfig.hum }}>
              <AreaChart
                data={filteredHumidityData}
                margin={{ left: 12, right: 12 }}
              >
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
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-center gap-2 text-sm">
              <div className="flex-1 text-sm text-muted-foreground">
                Last reading at {latestHum.time}
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Combined Card */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Temperature & Humidity</CardTitle>
              <CardDescription>DHT11 / Combined example data</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ temp: chartConfig.temp, hum: chartConfig.hum }}
            >
              <AreaChart
                data={filteredTempData.map((d, i) => ({
                  time: d.time,
                  temp: d.temp,
                  hum: filteredHumidityData[i]?.hum,
                }))}
                margin={{ left: 12, right: 12 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis yAxisId="left" domain={["dataMin - 2", "dataMax + 2"]} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={["dataMin - 5", "dataMax + 5"]}
                />

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

                <Area
                  yAxisId="right"
                  dataKey="hum"
                  name="(%)"
                  type="natural"
                  fill="var(--color-hum)"
                  fillOpacity={0.4}
                  stroke="var(--color-hum)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-center justify-between gap-2 text-sm">
              <div className="flex-1 text-sm text-muted-foreground">
                Last reading at {latestTemp.time}
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
