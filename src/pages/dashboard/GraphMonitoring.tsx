"use client";

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
  const latestTemp = tempData[tempData.length - 1];
  const latestHum = humidityData[humidityData.length - 1];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Graph Monitoring</h2>
        <p className="text-muted-foreground">
          Temperature & Humidity example charts
        </p>
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
              <AreaChart data={tempData} margin={{ left: 12, right: 12 }}>
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
              <AreaChart data={humidityData} margin={{ left: 12, right: 12 }}>
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
                data={tempData.map((d, i) => ({
                  time: d.time,
                  temp: d.temp,
                  hum: humidityData[i]?.hum,
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
