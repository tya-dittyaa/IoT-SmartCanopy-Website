"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { AlertCircle, RefreshCw } from "lucide-react";

export const description = "Graph monitoring for Temperature and Humidity";

import {
  fetchHumidityTelemetry,
  fetchTemperatureTelemetry,
} from "@/api/telemetries";
import { useDevice } from "@/contexts/device-context";
import type { TelemetryDto } from "@/types/telemetry";

// initial empty arrays; will be replaced by fetched data
const tempDataInit: Array<{ time: string; temp: number }> = [];
const humidityDataInit: Array<{ time: string; hum: number }> = [];

const chartConfig = {
  temp: { label: "Temperature (°C)", color: "#ef4444" },
  hum: { label: "Humidity (%)", color: "#3b82f6" },
} satisfies ChartConfig;

export default function GraphMonitoring() {
  const [selectedRange, setSelectedRange] = useState<
    "15m" | "30m" | "1h" | "6h" | "1d" | "7d"
  >("15m");

  const [tempData, setTempData] =
    useState<Array<{ time: string; temp: number }>>(tempDataInit);
  const [humidityData, setHumidityData] =
    useState<Array<{ time: string; hum: number }>>(humidityDataInit);
  // loading/error states removed — global Alert handles connection state

  // use selected device from context
  const { selectedDeviceId, wsStatus } = useDevice();

  // read connection flag for effect dependency (primitive)
  const isConnected = wsStatus?.isConnected ?? false;

  // Do NOT auto-select a device here. Require an explicit selection and
  // connection (see LiveMonitoring) before fetching telemetry.

  const rangeToPoints = useMemo<Record<string, number>>(
    () => ({
      "15m": 3,
      "30m": 4,
      "1h": 6,
      "6h": tempData.length,
      "1d": tempData.length,
      "7d": tempData.length,
    }),
    [tempData.length]
  );

  const filteredTempData = useMemo(() => {
    const count = rangeToPoints[selectedRange] ?? tempData.length;
    return tempData.slice(Math.max(0, tempData.length - count));
  }, [selectedRange, rangeToPoints, tempData]);

  const filteredHumidityData = useMemo(() => {
    const count = rangeToPoints[selectedRange] ?? humidityData.length;
    return humidityData.slice(Math.max(0, humidityData.length - count));
  }, [selectedRange, rangeToPoints, humidityData]);

  const latestTemp =
    filteredTempData[filteredTempData.length - 1] ??
    tempData[tempData.length - 1];
  const latestHum =
    filteredHumidityData[filteredHumidityData.length - 1] ??
    humidityData[humidityData.length - 1];

  // Refresh / polling logic: fetch immediately and then every 10s
  const REFRESH_INTERVAL = 30; // seconds (fixed)
  const [nextRefresh, setNextRefresh] = useState<number>(REFRESH_INTERVAL);

  const fetchTelemetry = useCallback(async () => {
    let mounted = true;

    try {
      const rangeToMinutes: Record<string, number> = {
        "15m": 15,
        "30m": 30,
        "1h": 60,
        "6h": 60 * 6,
        "1d": 60 * 24,
        "7d": 60 * 24 * 7,
      };

      const minutes = rangeToMinutes[selectedRange] ?? 1000;
      const deviceKey = selectedDeviceId;

      if (!deviceKey || !isConnected) {
        setTempData([]);
        setHumidityData([]);
        return;
      }

      const [tempArr, humArr] = await Promise.all([
        fetchTemperatureTelemetry(deviceKey, minutes),
        fetchHumidityTelemetry(deviceKey, minutes),
      ]);

      if (!mounted) return;

      const temps = (tempArr || []).map((t: TelemetryDto) => ({
        time: t.time ? new Date(t.time).toLocaleString() : t.time,
        temp: t.value,
      }));
      const hums = (humArr || []).map((h: TelemetryDto) => ({
        time: h.time ? new Date(h.time).toLocaleString() : h.time,
        hum: h.value,
      }));

      setTempData(temps);
      setHumidityData(hums);
    } catch {
      // swallow error — we don't surface per-card errors here
      // but you could log or set a global error state if needed
    }

    return () => {
      mounted = false;
    };
  }, [selectedRange, selectedDeviceId, isConnected]);

  useEffect(() => {
    // only run polling when a device is selected and connected
    if (!selectedDeviceId || !isConnected) {
      setNextRefresh(REFRESH_INTERVAL);
      return;
    }

    // trigger immediate fetch
    void fetchTelemetry();
    setNextRefresh(REFRESH_INTERVAL);

    // countdown interval every 1s
    const tick = setInterval(() => {
      setNextRefresh((s) => {
        if (s <= 1) {
          // time to refresh
          void fetchTelemetry();
          return REFRESH_INTERVAL;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [fetchTelemetry, selectedDeviceId, isConnected]);

  // Available range options for the tabs (typed)
  const ranges = ["15m", "30m", "1h", "6h", "1d", "7d"] as const;

  return (
    <div className="space-y-6">
      {/* Connection Alert */}
      {!isConnected && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            No device connected. Please select a device and connect to view
            graph data.
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h2 className="text-2xl font-bold">Graph Monitoring</h2>
        <p className="text-muted-foreground">
          Temperature & Humidity example charts
        </p>
      </div>

      {/* Global time-range tabs that affect all three charts —
          layout: stacked on mobile, tabs left + controls right on md+ */}
      <div className="flex w-full flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="md:flex-1">
          <Tabs
            defaultValue="15m"
            value={selectedRange}
            onValueChange={(v: string) =>
              setSelectedRange(v as "15m" | "30m" | "1h" | "6h" | "1d" | "7d")
            }
            className="w-full md:w-[520px]"
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

        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2 md:mt-0 md:ml-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex-1 md:flex-none md:text-right">
            {selectedDeviceId && isConnected
              ? `Refresh in ${nextRefresh}s`
              : "Refresh paused"}
          </div>
          <div className="flex-none">
            <button
              type="button"
              onClick={() => {
                if (!selectedDeviceId || !isConnected) return;
                void fetchTelemetry();
                setNextRefresh(REFRESH_INTERVAL);
              }}
              disabled={!selectedDeviceId || !isConnected}
              aria-label="Refresh now"
              title="Refresh now"
              className="p-2 rounded bg-slate-100 text-slate-800 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
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
                Last reading at {latestTemp?.time ?? "-"}
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
                Last reading at {latestHum?.time ?? "-"}
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
                Last reading at {latestTemp?.time ?? "-"}
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
