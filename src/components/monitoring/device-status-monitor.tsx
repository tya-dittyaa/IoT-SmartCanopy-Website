import { useConnection } from "@/contexts/connection-context";
import { useMQTT } from "@/hooks/use-mqtt";
import { useEffect, useMemo } from "react";

interface DeviceStatusMonitorProps {
  children: React.ReactNode;
}

export function DeviceStatusMonitor({ children }: DeviceStatusMonitorProps) {
  const {
    selectedDeviceId,
    updateDeviceStatus,
    updateMQTTStatus,
    getSelectedDeviceConfig,
  } = useConnection();

  const selectedDeviceConfig = useMemo(
    () => getSelectedDeviceConfig(),
    [getSelectedDeviceConfig]
  );

  // Monitor the currently selected device
  const {
    lastHeartbeat,
    connected,
    connecting,
    connectionError,
    heartbeatAge,
  } = useMQTT(selectedDeviceConfig || undefined);

  // Update MQTT connection status
  useEffect(() => {
    updateMQTTStatus({
      isConnected: connected,
      isConnecting: connecting,
      connectionError,
    });
  }, [connected, connecting, connectionError, updateMQTTStatus]);

  // Update device status when heartbeat data changes
  useEffect(() => {
    if (selectedDeviceId) {
      const isConnected =
        connected && heartbeatAge !== null && heartbeatAge < 30; // 30 seconds timeout

      updateDeviceStatus(selectedDeviceId, {
        lastHeartbeat,
        isConnected,
      });
    }
  }, [
    selectedDeviceId,
    lastHeartbeat,
    connected,
    heartbeatAge,
    updateDeviceStatus,
  ]);

  return <>{children}</>;
}
