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

export default function GraphMonitoring() {
  const [selectedRange, setSelectedRange] = useState<Range>("15m");

  const [tempData, setTempData] =
    useState<Array<{ time: string; temp: number }>>(tempDataInit);
  const [humidityData, setHumidityData] =
    useState<Array<{ time: string; hum: number }>>(humidityDataInit);

  const { selectedDeviceId, wsStatus, getSelectedDevice } = useDevice();

  const isConnected = wsStatus?.isConnected ?? false;
  const selectedDevice = getSelectedDevice();
  const deviceIsConnected = selectedDevice?.isConnected ?? false;
  const canFetch = !!selectedDeviceId && isConnected && deviceIsConnected;

  const filteredTempData = useMemo(() => tempData, [tempData]);
  const filteredHumidityData = useMemo(() => humidityData, [humidityData]);

  const latestTemp =
    filteredTempData[filteredTempData.length - 1] ??
    tempData[tempData.length - 1];
  const latestHum =
    filteredHumidityData[filteredHumidityData.length - 1] ??
    humidityData[humidityData.length - 1];

  const REFRESH_INTERVAL = 30; // seconds (fixed)
  const [nextRefresh, setNextRefresh] = useState<number>(REFRESH_INTERVAL);

  const fetchTelemetry = useCallback(async () => {
    let mounted = true;

    try {
      const minutes = RANGE_TO_MINUTES[selectedRange] ?? 1000;
      const deviceKey = selectedDeviceId;

      if (!deviceKey || !canFetch) {
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
      // swallow error
    }

    return () => {
      mounted = false;
    };
  }, [selectedRange, selectedDeviceId, canFetch]);

  useEffect(() => {
    if (!canFetch) {
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
  }, [fetchTelemetry, selectedDeviceId, canFetch]);

  const ranges = RANGES;

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
          Temperature & Humidity example charts
        </p>
      </div>

      <div className="flex w-full flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="md:flex-1">
          <Tabs
            defaultValue="15m"
            value={selectedRange}
            onValueChange={(v: string) =>
              canFetch && setSelectedRange(v as Range)
            }
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
              onClick={() => {
                if (!selectedDeviceId || !canFetch) return;
                void fetchTelemetry();
                setNextRefresh(REFRESH_INTERVAL);
              }}
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
        {/* Temperature Card */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <div>
              <CardTitle>Temperature</CardTitle>
              <CardDescription>DHT11 / Example data</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <TemperatureArea data={filteredTempData} />
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
        <Card className="flex flex-col h-full">
          <CardHeader>
            <div>
              <CardTitle>Humidity</CardTitle>
              <CardDescription>DHT11 / Example data</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <HumidityArea data={filteredHumidityData} />
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
        <Card className="flex flex-col h-full">
          <CardHeader>
            <div>
              <CardTitle>Temperature & Humidity</CardTitle>
              <CardDescription>DHT11 / Combined example data</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <CombinedArea
              data={filteredTempData.map((d, i) => ({
                time: d.time,
                temp: d.temp,
                hum: filteredHumidityData[i]?.hum,
              }))}
            />
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
