import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { useConnection } from "@/contexts/connection-context";
import { useMQTT } from "@/hooks/use-mqtt";
import { Wifi, WifiOff } from "lucide-react";

export default function DashboardHome() {
  const { getSelectedDeviceConfig } = useConnection();
  const selectedDeviceConfig = getSelectedDeviceConfig();

  const { connected } = useMQTT(selectedDeviceConfig || undefined);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight">
            Hey there, welcome! 👋
          </h1>

          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Monitor your smart canopy system using the sidebar navigation
          </p>

          {/* Connection Status */}
          <div className="flex items-center justify-center gap-2">
            {connected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <Badge variant="default" className="bg-green-500">
                  MQTT Connected
                </Badge>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <Badge variant="destructive">MQTT Disconnected</Badge>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
