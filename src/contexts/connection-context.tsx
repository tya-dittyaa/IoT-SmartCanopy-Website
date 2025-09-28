/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useState } from "react";
import type { DeviceConfig } from "../config/devices";
import { deviceConfigs } from "../config/devices";

export interface DeviceStatus {
  lastHeartbeat: number | null;
  isConnected: boolean;
}

export interface MQTTConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
}

export interface ConnectionContextType {
  selectedDeviceId: string;
  setSelectedDeviceId: (deviceId: string) => void;
  availableDevices: DeviceConfig[];
  deviceStatuses: Record<string, DeviceStatus>;
  updateDeviceStatus: (deviceId: string, status: DeviceStatus) => void;
  getSelectedDeviceConfig: () => DeviceConfig | undefined;
  mqttStatus: MQTTConnectionStatus;
  updateMQTTStatus: (status: MQTTConnectionStatus) => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(
  undefined
);

export const ConnectionProvider = ({ children }: { children: ReactNode }) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [deviceStatuses, setDeviceStatuses] = useState<
    Record<string, DeviceStatus>
  >({});
  const [mqttStatus, setMQTTStatus] = useState<MQTTConnectionStatus>({
    isConnected: false,
    isConnecting: false,
    connectionError: null,
  });

  // Use device configs from the imported configuration
  const availableDevices = deviceConfigs;

  const updateDeviceStatus = useCallback(
    (deviceId: string, status: DeviceStatus) => {
      setDeviceStatuses((prev) => ({
        ...prev,
        [deviceId]: status,
      }));
    },
    []
  );

  const updateMQTTStatus = useCallback((status: MQTTConnectionStatus) => {
    setMQTTStatus(status);
  }, []);

  const getSelectedDeviceConfig = useCallback((): DeviceConfig | undefined => {
    return availableDevices.find(
      (device) => device.deviceId === selectedDeviceId
    );
  }, [availableDevices, selectedDeviceId]);

  return (
    <ConnectionContext.Provider
      value={{
        selectedDeviceId,
        setSelectedDeviceId,
        availableDevices,
        deviceStatuses,
        updateDeviceStatus,
        getSelectedDeviceConfig,
        mqttStatus,
        updateMQTTStatus,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error("useConnection must be used within a ConnectionProvider");
  }
  return context;
};
