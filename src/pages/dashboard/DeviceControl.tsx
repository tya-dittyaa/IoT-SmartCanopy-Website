import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDevice } from "@/contexts/device-context";
import { AlertCircle } from "lucide-react";

export default function DeviceControl() {
  const { wsStatus, telemetryData, publishMode, publishServo } = useDevice();
  const connected = wsStatus.isConnected;
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
      case "OPEN":
        return "🔓";
      case "CLOSED":
        return "🔒";
      default:
        return "❓";
    }
  };

  const isServoOpen = telemetry.servoStatus === "OPEN";
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
                variant={!isServoOpen ? "default" : "outline"}
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
