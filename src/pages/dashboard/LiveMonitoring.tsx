import {
  HumidityRadial,
  TemperatureRadial,
} from "@/components/charts/radial-charts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConnection } from "@/contexts/connection-context";
import { useMQTT } from "@/hooks/use-mqtt";
import { AlertCircle } from "lucide-react";

export default function LiveMonitoring() {
  const { getSelectedDeviceConfig } = useConnection();
  const selectedDeviceConfig = getSelectedDeviceConfig();

  const { connected, telemetry } = useMQTT(selectedDeviceConfig || undefined);

  const getRainStatusIcon = () => {
    switch (telemetry.rainStatus) {
      case "Rain":
        return "🌧️";
      case "No Rain":
        return "☀️";
      default:
        return "❓";
    }
  };

  const getServoStatusIcon = () => {
    if (telemetry.servoStatus === "Unknown") return "❓";
    return telemetry.servoStatus.toLowerCase().includes("open") ? "🔓" : "🔒";
  };

  return (
    <div className="space-y-6">
      {/* Connection Alert */}
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Temperature */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-col h-full">
              <div className="flex-1 flex items-center justify-center">
                <TemperatureRadial
                  value={connected ? telemetry.temperature : 0}
                />
              </div>
              <div className="text-center pb-2">
                <div className="text-xs text-muted-foreground">DHT11</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Humidity */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Humidity</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-col h-full">
              <div className="flex-1 flex items-center justify-center">
                <HumidityRadial value={connected ? telemetry.humidity : 0} />
              </div>
              <div className="text-center pb-2">
                <div className="text-xs text-muted-foreground">DHT11</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rain Status */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rain Status</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-col h-full">
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-8xl mb-4">{getRainStatusIcon()}</div>
                <div className="text-xl font-bold">
                  {connected ? telemetry.rainStatus : "Unknown"}
                </div>
              </div>
              <div className="text-center pb-2">
                <div className="text-xs text-muted-foreground">LDR Sensor</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Canopy Status */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Canopy Status</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-col h-full">
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-8xl mb-4">{getServoStatusIcon()}</div>
                <div className="text-xl font-bold">
                  {connected ? telemetry.servoStatus : "Unknown"}
                </div>
              </div>
              <div className="text-center pb-2">
                <div className="text-xs text-muted-foreground">Servo</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
