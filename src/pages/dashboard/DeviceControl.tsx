import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMqtt } from "@/contexts/mqtt-context";
import { AlertCircle } from "lucide-react";

export default function DeviceControl() {
  const {
    mqttStatus,
    telemetryData,
    awaitingHeartbeat,
    publishMode,
    publishServo,
  } = useMqtt();
  const connected = mqttStatus.isConnected;
  const telemetry = telemetryData;

  const getModeIcon = () => {
    switch (telemetry.mode) {
      case "auto":
        return "🤖";
      case "manual":
        return "👤";
      default:
        return "❓";
    }
  };

  const getServoStatusIcon = () => {
    if (telemetry.servoStatus === "Unknown") return "❓";
    return telemetry.servoStatus.toLowerCase().includes("open") ? "🔓" : "🔒";
  };

  const isServoOpen = telemetry.servoStatus.toLowerCase().includes("open");
  const canControlServo = connected && telemetry.mode === "manual";

  return (
    <div className="space-y-6">
      {/* Connection Alert */}
      {!connected && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            No device connected. Please select a device and connect to control
            it.
          </AlertDescription>
        </Alert>
      )}

      {/* Heartbeat Alert */}
      {connected && awaitingHeartbeat && (
        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            Connected to MQTT broker but waiting for device to send telemetry
            data...
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h2 className="text-2xl font-bold">Device Control</h2>
        <p className="text-muted-foreground">
          Control your Smart Canopy device mode and servo operations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mode Control */}
        <Card>
          <CardHeader>
            <CardTitle>Operating Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="text-6xl">{getModeIcon()}</div>
            </div>

            <div className="text-center mb-6">
              <Badge
                variant={telemetry.mode === "auto" ? "default" : "secondary"}
                className="text-lg py-2 px-4"
              >
                {connected ? telemetry.mode?.toUpperCase() : "UNKNOWN"}
              </Badge>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => publishMode("auto")}
                disabled={!connected || telemetry.mode === "auto"}
                variant={telemetry.mode === "auto" ? "default" : "outline"}
                className="w-full"
              >
                🤖 Auto Mode
              </Button>
              <Button
                onClick={() => publishMode("manual")}
                disabled={!connected || telemetry.mode === "manual"}
                variant={telemetry.mode === "manual" ? "default" : "outline"}
                className="w-full"
              >
                👤 Manual Mode
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Operating Canopy */}
        <Card>
          <CardHeader>
            <CardTitle>Operating Canopy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="text-6xl">{getServoStatusIcon()}</div>
            </div>

            <div className="text-center mb-6">
              <Badge
                variant={isServoOpen ? "default" : "secondary"}
                className="text-lg py-2 px-4"
              >
                {connected ? telemetry.servoStatus : "UNKNOWN"}
              </Badge>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => publishServo("open")}
                disabled={!canControlServo || isServoOpen}
                variant={isServoOpen ? "default" : "outline"}
                className="w-full"
              >
                🔓 Open Canopy
              </Button>
              <Button
                onClick={() => publishServo("close")}
                disabled={!canControlServo || !isServoOpen}
                variant={isServoOpen ? "default" : "outline"}
                className="w-full"
              >
                🔒 Close Canopy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
