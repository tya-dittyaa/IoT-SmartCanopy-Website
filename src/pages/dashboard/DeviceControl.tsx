import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDevice } from "@/contexts/device-context";
import { AlertCircle } from "lucide-react";
import { useCallback, useMemo } from "react";

export default function DeviceControl() {
  const {
    telemetryData,
    publishMode,
    publishServo,
    selectedDevice,
    mqttStatus,
  } = useDevice();

  const { mode, servoStatus } = telemetryData;

  const connected = useMemo(
    () => (selectedDevice?.isConnected ?? false) && mqttStatus.isConnected,
    [selectedDevice, mqttStatus.isConnected]
  );

  const isModeKnown = useMemo(() => mode !== "unknown", [mode]);
  const isServoKnown = useMemo(() => servoStatus !== "unknown", [servoStatus]);
  const isServoOpen = useMemo(() => servoStatus === "open", [servoStatus]);

  const canControlServo = useMemo(
    () => connected && isModeKnown && mode === "manual",
    [connected, isModeKnown, mode]
  );

  const modeIcon = useMemo(() => {
    switch (mode) {
      case "auto":
        return "🤖";
      case "manual":
        return "👤";
      default:
        return "❓";
    }
  }, [mode]);

  const servoStatusIcon = useMemo(() => {
    switch (servoStatus) {
      case "open":
        return "🔓";
      case "closed":
        return "🔒";
      default:
        return "❓";
    }
  }, [servoStatus]);

  const handleSetAuto = useCallback(() => publishMode("auto"), [publishMode]);
  const handleSetManual = useCallback(
    () => publishMode("manual"),
    [publishMode]
  );
  const handleServoOpen = useCallback(
    () => publishServo("open"),
    [publishServo]
  );
  const handleServoClose = useCallback(
    () => publishServo("close"),
    [publishServo]
  );

  return (
    <div className="space-y-6">
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
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>Operating Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="flex items-center justify-center mb-6">
              <div className="text-6xl">{modeIcon}</div>
            </div>

            <div className="text-center mb-6">
              <Badge
                variant={connected && mode === "auto" ? "default" : "secondary"}
                className="text-lg py-2 px-4"
              >
                {connected ? mode?.toUpperCase() : "UNKNOWN"}
              </Badge>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleSetAuto}
                disabled={!connected || !isModeKnown || mode === "auto"}
                variant={connected && mode === "auto" ? "default" : "outline"}
                className="w-full"
              >
                🤖 Auto Mode
              </Button>
              <Button
                onClick={handleSetManual}
                disabled={!connected || !isModeKnown || mode === "manual"}
                variant={connected && mode === "manual" ? "default" : "outline"}
                className="w-full"
              >
                👤 Manual Mode
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>Operating Canopy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="flex items-center justify-center mb-6">
              <div className="text-6xl">{servoStatusIcon}</div>
            </div>

            <div className="text-center mb-6">
              <Badge
                variant={connected && isServoOpen ? "default" : "secondary"}
                className="text-lg py-2 px-4"
              >
                {connected ? servoStatus?.toUpperCase() : "UNKNOWN"}
              </Badge>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleServoOpen}
                disabled={!canControlServo || isServoOpen || !isServoKnown}
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
                onClick={handleServoClose}
                disabled={!canControlServo || !isServoOpen || !isServoKnown}
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
