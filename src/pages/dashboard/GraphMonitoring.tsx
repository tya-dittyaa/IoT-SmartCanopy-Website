"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, RefreshCw } from "lucide-react";

export const description = "Graph monitoring for Temperature and Humidity";

import {
  fetchHumidityTelemetry,
  fetchTemperatureTelemetry,
} from "@/api/telemetries";
import CombinedArea from "@/components/charts/combined-area";
import HumidityArea from "@/components/charts/humidity-area";
import TemperatureArea from "@/components/charts/temperature-area";
import { useDevice } from "@/contexts/device-context";
import RANGES, { RANGE_TO_MINUTES, type Range } from "@/types/range";
import type { TelemetryDto } from "@/types/telemetry";

const tempDataInit: Array<{ time: string; temp: number }> = [];
const humidityDataInit: Array<{ time: string; hum: number }> = [];
const REFRESH_INTERVAL = 30; // seconds (fixed)
const ranges = RANGES;

export default function GraphMonitoring() {
  const [selectedRange, setSelectedRange] = useState<Range>("15m");
  const [tempData, setTempData] =
    useState<Array<{ time: string; temp: number }>>(tempDataInit);
  const [humidityData, setHumidityData] =
    useState<Array<{ time: string; hum: number }>>(humidityDataInit);
  const [nextRefresh, setNextRefresh] = useState<number>(REFRESH_INTERVAL);

  const { selectedDeviceId, mqttStatus, selectedDevice } = useDevice();

  const isConnected = useMemo(
    () => mqttStatus?.isConnected ?? false,
    [mqttStatus]
  );
  const deviceIsConnected = useMemo(
    () => selectedDevice?.isConnected ?? false,
    [selectedDevice]
  );

  const canFetch = useMemo(
    () => !!selectedDeviceId && isConnected && deviceIsConnected,
    [selectedDeviceId, isConnected, deviceIsConnected]
  );

  const latestTemp = useMemo(
    () => (tempData.length > 0 ? tempData[tempData.length - 1] : undefined),
    [tempData]
  );
  const latestHum = useMemo(
    () =>
      humidityData.length > 0
        ? humidityData[humidityData.length - 1]
        : undefined,
    [humidityData]
  );

  const fetchTelemetry = useCallback(async () => {
    let mounted = true;
    if (!selectedDeviceId || !canFetch) {
      setTempData([]);
      setHumidityData([]);
      return () => {
        mounted = false;
      };
    }

    try {
      const minutes = RANGE_TO_MINUTES[selectedRange] ?? 1000;
      const deviceKey = selectedDeviceId;

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
      // swallow error
    }

    return () => {
      mounted = false;
    };
  }, [selectedRange, selectedDeviceId, canFetch]);

  useEffect(() => {
    if (!canFetch) {
      setTempData([]);
      setHumidityData([]);
      setNextRefresh(REFRESH_INTERVAL);
      return;
    }

    void fetchTelemetry();
    setNextRefresh(REFRESH_INTERVAL);

    const tick = setInterval(() => {
      setNextRefresh((s) => {
        if (s <= 1) {
          void fetchTelemetry();
          return REFRESH_INTERVAL;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [fetchTelemetry, canFetch]);

  const handleRangeChange = useCallback(
    (v: string) => {
      if (canFetch) {
        setSelectedRange(v as Range);
      }
    },
    [canFetch]
  );

  const handleRefresh = useCallback(() => {
    if (!selectedDeviceId || !canFetch) return;
    void fetchTelemetry();
    setNextRefresh(REFRESH_INTERVAL);
  }, [selectedDeviceId, canFetch, fetchTelemetry]);

  const combinedData = useMemo(() => {
    return tempData.map((d, i) => ({
      time: d.time,
      temp: d.temp,
      hum: humidityData[i]?.hum,
    }));
  }, [tempData, humidityData]);

  return (
    <div className="space-y-6">
      {!canFetch && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            {isConnected && !deviceIsConnected
              ? "Selected device is offline. Please ensure the device is connected to view graph data."
              : "No device connected. Please select a device and connect to view graph data."}
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h2 className="text-2xl font-bold">Graph Monitoring</h2>
        <p className="text-muted-foreground">
          Temperature & Humidity monitoring graphs
        </p>
      </div>

      <div className="flex w-full flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="md:flex-1">
          <Tabs
            defaultValue="15m"
            value={selectedRange}
            onValueChange={handleRangeChange}
            className={`w-full md:w-[520px] ${
              !canFetch ? "opacity-70 pointer-events-none" : ""
            }`}
          >
            <TabsList className="gap-2 p-1">
              {ranges.map((r) => (
                <TabsTrigger
                  key={r}
                  value={r}
                  className="px-3 py-1 text-base"
                  disabled={!canFetch}
                >
                  {r}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2 md:mt-0 md:ml-4 w-full md:w-auto justify-start md:justify-end">
          <div className="flex-none order-1 md:order-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={!selectedDeviceId || !canFetch}
              aria-label="Refresh now"
              title="Refresh now"
              className="p-2 rounded bg-slate-100 text-slate-800 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 md:flex-none md:text-right order-2 md:order-1">
            {selectedDeviceId && canFetch
              ? `Refresh in ${nextRefresh}s`
              : "Refresh paused"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
        <Card className="flex flex-col h-full">
          <CardHeader>
            <div>
              <CardTitle>Temperature</CardTitle>
              <CardDescription>DHT11</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <TemperatureArea data={tempData} />
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-center gap-2 text-sm">
              <div className="flex-1 text-sm text-muted-foreground">
                Last reading at {latestTemp?.time ?? "-"}
              </div>
            </div>
          </CardFooter>
        </Card>

        <Card className="flex flex-col h-full">
          <CardHeader>
            <div>
              <CardTitle>Humidity</CardTitle>
              <CardDescription>DHT11</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <HumidityArea data={humidityData} />
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-center gap-2 text-sm">
              <div className="flex-1 text-sm text-muted-foreground">
                Last reading at {latestHum?.time ?? "-"}
              </div>
            </div>
          </CardFooter>
        </Card>

        <Card className="flex flex-col h-full">
          <CardHeader>
            <div>
              <CardTitle>Temperature & Humidity</CardTitle>
              <CardDescription>DHT11</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <CombinedArea data={combinedData} />
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
