import { HumidityRadial } from "@/components/charts/humidity-radial";
import { TemperatureRadial } from "@/components/charts/temperature-radial";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDevice } from "@/contexts/device-context";
import { AlertCircle } from "lucide-react";
import { useMemo } from "react";

export default function LiveMonitoring() {
  const { mqttStatus, telemetryData, selectedDevice } = useDevice();
  const { temperature, humidity, rainStatus, servoStatus } = telemetryData;

  const connected = useMemo(() => {
    const isMqttConnected = mqttStatus?.isConnected ?? false;
    const isDeviceConnected = selectedDevice?.isConnected ?? false;
    return isMqttConnected && isDeviceConnected;
  }, [mqttStatus, selectedDevice]);

  const tempValue = useMemo(
    () => (connected ? temperature : null),
    [connected, temperature]
  );
  const humValue = useMemo(
    () => (connected ? humidity : null),
    [connected, humidity]
  );

  const rainStatusIcon = useMemo(() => {
    const status = rainStatus ?? "unknown";
    switch (status) {
      case "rain":
        return "🌧️";
      case "dry":
        return "☀️";
      default:
        return "❓";
    }
  }, [rainStatus]);

  const rainStatusText = useMemo(
    () => (connected ? rainStatus?.toUpperCase() : "UNKNOWN"),
    [connected, rainStatus]
  );

  const servoStatusIcon = useMemo(() => {
    const status = servoStatus ?? "unknown";
    switch (status) {
      case "open":
        return "🔓";
      case "closed":
        return "🔒";
      default:
        return "❓";
    }
  }, [servoStatus]);

  const servoStatusText = useMemo(
    () => (connected ? servoStatus?.toUpperCase() : "UNKNOWN"),
    [connected, servoStatus]
  );

  return (
    <div className="space-y-6">
      {!connected && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            No device connected. Please select a device and connect to view live
            data.
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h2 className="text-2xl font-bold">Live Data Monitoring</h2>
        <p className="text-muted-foreground">
          Real-time sensor data from your Smart Canopy device
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 auto-rows-fr">
        <Card className="flex flex-col h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-col h-full">
              <div className="flex-1 flex items-center justify-center">
                <TemperatureRadial value={tempValue} />
              </div>
              <div className="text-center pb-2">
                <div className="text-xs text-muted-foreground">DHT11</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Humidity</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-col h-full">
              <div className="flex-1 flex items-center justify-center">
                <HumidityRadial value={humValue} />
              </div>
              <div className="text-center pb-2">
                <div className="text-xs text-muted-foreground">DHT11</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rain Status</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-col h-full">
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-8xl mb-4">{rainStatusIcon}</div>
                <div className="text-xl font-bold">{rainStatusText}</div>
              </div>
              <div className="text-center pb-2">
                <div className="text-xs text-muted-foreground">
                  Raindrop Sensor
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Canopy Status</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-col h-full">
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-8xl mb-4">{servoStatusIcon}</div>
                <div className="text-xl font-bold">{servoStatusText}</div>
              </div>
              <div className="text-center pb-2">
                <div className="text-xs text-muted-foreground">Servo Motor</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
