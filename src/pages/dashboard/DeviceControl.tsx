import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDevice } from "@/contexts/device-context";
import { AlertCircle } from "lucide-react";

export default function DeviceControl() {
  const {
    telemetryData,
    publishMode,
    publishServo,
    selectedDevice,
    mqttStatus,
  } = useDevice();
  const deviceConnected = selectedDevice?.isConnected ?? false;
  const connected = deviceConnected && mqttStatus.isConnected;
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
    switch (telemetry.servoStatus) {
      case "open":
        return "🔓";
      case "closed":
        return "🔒";
      default:
        return "❓";
    }
  };

  const isModeKnown = telemetry.mode !== "unknown";
  const isServoKnown = telemetry.servoStatus !== "unknown";
  const isServoOpen = telemetry.servoStatus === "open";
  const canControlServo =
    connected && isModeKnown && telemetry.mode === "manual";

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

      <div>
        <h2 className="text-2xl font-bold">Device Control</h2>
        <p className="text-muted-foreground">
          Control your Smart Canopy device mode and servo operations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
        {/* Mode Control */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>Operating Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="flex items-center justify-center mb-6">
              <div className="text-6xl">{getModeIcon()}</div>
            </div>

            <div className="text-center mb-6">
              <Badge
                variant={
                  connected && telemetry.mode === "auto"
                    ? "default"
                    : "secondary"
                }
                className="text-lg py-2 px-4"
              >
                {connected ? telemetry.mode?.toUpperCase() : "UNKNOWN"}
              </Badge>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => publishMode("auto")}
                disabled={
                  !connected || !isModeKnown || telemetry.mode === "auto"
                }
                variant={
                  connected && telemetry.mode === "auto" ? "default" : "outline"
                }
                className="w-full"
              >
                🤖 Auto Mode
              </Button>
              <Button
                onClick={() => publishMode("manual")}
                disabled={
                  !connected || !isModeKnown || telemetry.mode === "manual"
                }
                variant={
                  connected && telemetry.mode === "manual"
                    ? "default"
                    : "outline"
                }
                className="w-full"
              >
                👤 Manual Mode
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Operating Canopy */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>Operating Canopy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="flex items-center justify-center mb-6">
              <div className="text-6xl">{getServoStatusIcon()}</div>
            </div>

            <div className="text-center mb-6">
              <Badge
                variant={connected && isServoOpen ? "default" : "secondary"}
                className="text-lg py-2 px-4"
              >
                {connected ? telemetry.servoStatus?.toUpperCase() : "UNKNOWN"}
              </Badge>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => publishServo("open")}
                disabled={
                  !canControlServo ||
                  isServoOpen ||
                  telemetry.servoStatus === "unknown"
                }
                variant={
                  connected && isServoKnown && isServoOpen
                    ? "default"
                    : "outline"
                }
                className="w-full"
              >
                🔓 Open Canopy
              </Button>
              <Button
                onClick={() => publishServo("close")}
                disabled={
                  !canControlServo ||
                  !isServoOpen ||
                  telemetry.servoStatus === "unknown"
                }
                variant={
                  connected && isServoKnown && !isServoOpen
                    ? "default"
                    : "outline"
                }
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
