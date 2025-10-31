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

import { fetchAllTelemetries } from "@/api/telemetries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDevice } from "@/contexts/device-context";
import RANGES, { RANGE_TO_MINUTES, type Range } from "@/types/range";
import type { TelemetryDto } from "@/types/telemetry";

const REFRESH_INTERVAL = 30;
const ranges = RANGES;

type Row = {
  rawTime: string;
  time: string;
  temperature?: number;
  humidity?: number;
  light?: number;
  rain?: number;
  servo?: number;
  mode?: number;
};

export default function TableData() {
  const [selectedRange, setSelectedRange] = useState<Range>("15m");
  const [rows, setRows] = useState<Row[]>([]);
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

  const fetchTelemetry = useCallback(async () => {
    if (!selectedDeviceId || !canFetch) {
      setRows([]);
      return;
    }

    try {
      const minutes = RANGE_TO_MINUTES[selectedRange] ?? 1000;
      const deviceKey = selectedDeviceId;
      const all = await fetchAllTelemetries(deviceKey, minutes);

      const map = new Map<string, Partial<Row>>();

      const add = (
        sensor: keyof Omit<Row, "rawTime" | "time">,
        arr?: TelemetryDto[]
      ) => {
        (arr || []).forEach((t) => {
          if (!t.time) return;
          const key = t.time;
          const existing: Partial<Row> = map.get(key) ?? { rawTime: key };
          existing.rawTime = key;
          existing[sensor] = t.value;
          map.set(key, existing);
        });
      };

      add("temperature", all.temperature);
      add("humidity", all.humidity);
      add("light", all.light);
      add("mode", all.mode);
      add("rain", all.rain);
      add("servo", all.servo);

      const grouped: Row[] = Array.from(map.values()).map((r) => ({
        rawTime: r.rawTime || "",
        time: r.rawTime
          ? new Date(r.rawTime).toLocaleString()
          : r.rawTime || "",
        temperature: r.temperature,
        humidity: r.humidity,
        light: r.light,
        mode: r.mode,
        rain: r.rain,
        servo: r.servo,
      }));

      grouped.sort(
        (a, b) => (Date.parse(b.rawTime) || 0) - (Date.parse(a.rawTime) || 0)
      );

      setRows(grouped);
    } catch {
      return;
    }
  }, [selectedDeviceId, canFetch, selectedRange]);

  useEffect(() => {
    if (!canFetch) {
      setRows([]);
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
      if (canFetch) setSelectedRange(v as Range);
    },
    [canFetch]
  );

  const handleRefresh = useCallback(() => {
    if (!selectedDeviceId || !canFetch) return;
    void fetchTelemetry();
    setNextRefresh(REFRESH_INTERVAL);
  }, [selectedDeviceId, canFetch, fetchTelemetry]);

  const formatTemp = (v?: number) => (typeof v === "number" ? `${v}°C` : "-");
  const formatPercent = (v?: number) => (typeof v === "number" ? `${v}%` : "-");
  const formatMode = (v?: number) =>
    typeof v === "number" ? (v === 1 ? "AUTO" : "MANUAL") : "-";
  const formatRain = (v?: number) =>
    typeof v === "number" ? (v === 1 ? "RAIN" : "DRY") : "-";
  const formatServo = (v?: number) =>
    typeof v === "number" ? (v === 1 ? "OPEN" : "CLOSED") : "-";

  return (
    <div className="space-y-6">
      {!canFetch && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            {isConnected && !deviceIsConnected
              ? "Selected device is offline. Please ensure the device is connected to view telemetry table."
              : "No device connected. Please select a device and connect to view telemetry table."}
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h2 className="text-2xl font-bold">Table Data</h2>
        <p className="text-muted-foreground">
          All telemetry entries (flattened) for the selected device
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

      <Card>
        <CardHeader>
          <CardTitle>All Telemetries</CardTitle>
          <CardDescription>
            Showing all telemetry data for the selected device in the last{" "}
            {selectedRange}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <tr>
                  <TableHead>Time</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Temperature</TableHead>
                  <TableHead>Humidity</TableHead>
                  <TableHead>Light Intensity</TableHead>
                  <TableHead>Rain Status</TableHead>
                  <TableHead>Servo Status</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={r.rawTime || i}>
                    <TableCell>{r.time ?? "-"}</TableCell>
                    <TableCell>{formatMode(r.mode)}</TableCell>
                    <TableCell>{formatTemp(r.temperature)}</TableCell>
                    <TableCell>{formatPercent(r.humidity)}</TableCell>
                    <TableCell>{formatPercent(r.light)}</TableCell>
                    <TableCell>{formatRain(r.rain)}</TableCell>
                    <TableCell>{formatServo(r.servo)}</TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      No telemetry data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            Showing {rows.length} rows
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
