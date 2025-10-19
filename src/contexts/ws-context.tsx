/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { DeviceConfig } from "../config/devices";
import { deviceConfigs } from "../config/devices";

export interface DeviceStatus {
  isConnected: boolean;
  lastSeen: number | null;
}

export interface TelemetryData {
  temperature: number | null;
  humidity: number | null;
  rainStatus: string;
  servoStatus: string;
  mode: "auto" | "manual" | "unknown";
}

export interface ISensorTelemetry {
  humidity: number;
  temperature: number;
  rainStatus: "DRY" | "RAIN";
  servoStatus: "OPEN" | "CLOSED";
  mode: "AUTO" | "MANUAL";
}

export interface WSConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
}

export interface WsContextType {
  selectedDeviceId: string;
  setSelectedDeviceId: (deviceId: string) => void;
  availableDevices: DeviceConfig[];
  deviceStatuses: Record<string, DeviceStatus>;
  updateDeviceStatus: (deviceId: string, status: DeviceStatus) => void;
  getSelectedDeviceConfig: () => DeviceConfig | undefined;
  wsStatus: WSConnectionStatus;
  updateWsStatus: (status: WSConnectionStatus) => void;
  telemetryData: TelemetryData;
  updateTelemetryData: (data: TelemetryData) => void;
  connectToDevice: () => void;
  disconnectFromDevice: () => void;
  publishMode: (mode: "auto" | "manual") => void;
  publishServo: (cmd: "open" | "close") => void;
}

const WsContext = createContext<WsContextType | undefined>(undefined);

export const WsProvider = ({ children }: { children: ReactNode }) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [wsStatus, setWsStatus] = useState<WSConnectionStatus>({ isConnected: false, isConnecting: false, connectionError: null });
  const [telemetryData, setTelemetryData] = useState<TelemetryData>({ temperature: null, humidity: null, rainStatus: "unknown", servoStatus: "unknown", mode: "unknown" });
  const [deviceStatuses, setDeviceStatuses] = useState<Record<string, DeviceStatus>>({});
  const socketRef = useRef<Socket | null>(null);
  const availableDevices = deviceConfigs;

  const resetTelemetryData = useCallback(() => {
    setTelemetryData({ temperature: null, humidity: null, rainStatus: "unknown", servoStatus: "unknown", mode: "unknown" });
  }, []);

  const updateDeviceStatus = useCallback((deviceId: string, status: DeviceStatus) => {
    setDeviceStatuses((prev) => ({ ...prev, [deviceId]: status }));
  }, []);

  const updateWsStatus = useCallback((status: WSConnectionStatus) => setWsStatus(status), []);

  const updateTelemetryData = useCallback((data: TelemetryData) => setTelemetryData(data), []);

  const getSelectedDeviceConfig = useCallback((): DeviceConfig | undefined => {
    return availableDevices.find((device) => device.deviceId === selectedDeviceId);
  }, [availableDevices, selectedDeviceId]);

  const connectWS = useCallback(() => {
    if (!selectedDeviceId) return;
    const deviceConfig = availableDevices.find((d) => d.deviceId === selectedDeviceId);
    if (!deviceConfig) return;
    if (socketRef.current && socketRef.current.active) return;

    setWsStatus({ isConnected: false, isConnecting: true, connectionError: null });
    resetTelemetryData();

    if (socketRef.current) {
      try {
        socketRef.current.disconnect();
      } catch (e) {
        void e;
      }
      socketRef.current = null;
    }

    let telemetryTimer: number | null = null;
    const clearTelemetryTimer = () => {
      if (telemetryTimer) {
        window.clearTimeout(telemetryTimer);
        telemetryTimer = null;
      }
    };

    const markNoTelemetry = () => {
      updateDeviceStatus(selectedDeviceId, { isConnected: false, lastSeen: null });
      setWsStatus({ isConnected: false, isConnecting: false, connectionError: "No telemetry received for 2 minutes" });
      if (socketRef.current) {
        try {
          socketRef.current.disconnect();
        } catch (e) {
          void e;
        }
        socketRef.current = null;
      }
    };

    try {
      const socket = io(deviceConfig.url, { autoConnect: false, transports: ["websocket"] });

      socket.on("connect", () => {
        updateDeviceStatus(selectedDeviceId, { isConnected: true, lastSeen: Date.now() });
        setWsStatus({ isConnected: true, isConnecting: false, connectionError: null });
        clearTelemetryTimer();
        telemetryTimer = window.setTimeout(markNoTelemetry, 120000) as unknown as number;
      });

      socket.on("devices/telemetry", (payload: { deviceKey?: string; sensorData?: ISensorTelemetry | null }) => {
        try {
          if (!payload) return;
          const { deviceKey, sensorData } = payload;
          if (!deviceKey || !sensorData) return;
          if (deviceKey !== selectedDeviceId) return;

          setTelemetryData((prev) => ({
            ...prev,
            ...(sensorData.temperature !== undefined && { temperature: Number(sensorData.temperature) }),
            ...(sensorData.humidity !== undefined && { humidity: Number(sensorData.humidity) }),
            ...(sensorData.rainStatus !== undefined && { rainStatus: sensorData.rainStatus === "RAIN" ? "rain" : "dry" }),
            ...(sensorData.servoStatus !== undefined && { servoStatus: sensorData.servoStatus === "OPEN" ? "open" : "closed" }),
            ...(sensorData.mode !== undefined && { mode: sensorData.mode === "MANUAL" ? "manual" : "auto" }),
          }));

          updateDeviceStatus(selectedDeviceId, { isConnected: true, lastSeen: Date.now() });
          clearTelemetryTimer();
          telemetryTimer = window.setTimeout(markNoTelemetry, 120000) as unknown as number;
        } catch (err) {
          console.error("Error handling telemetry payload:", err);
        }
      });

      socket.on("connect_error", (err: Error) => {
        console.error("Socket connect_error", err);
        setWsStatus({ isConnected: false, isConnecting: false, connectionError: err.message || "Connection failed" });
        updateDeviceStatus(selectedDeviceId, { isConnected: false, lastSeen: null });
        resetTelemetryData();
        clearTelemetryTimer();
        if (socketRef.current) {
          try {
            socketRef.current.disconnect();
          } catch (e) {
            void e;
          }
          socketRef.current = null;
        }
      });

      socket.on("error", (err: unknown) => {
        let message = "Socket error";
        if (err && typeof err === "object") {
          const possible = err as { message?: unknown };
          if (possible.message) message = String(possible.message);
        } else if (err) {
          message = String(err);
        }
        console.error("Socket error", err);
        setWsStatus({ isConnected: false, isConnecting: false, connectionError: message });
        updateDeviceStatus(selectedDeviceId, { isConnected: false, lastSeen: null });
        resetTelemetryData();
        clearTelemetryTimer();
        try {
          socket.disconnect();
        } catch (e) {
          void e;
        }
        socketRef.current = null;
      });

      socket.on("disconnect", (reason: string) => {
        setWsStatus({ isConnected: false, isConnecting: false, connectionError: `Disconnected: ${reason}` });
        updateDeviceStatus(selectedDeviceId, { isConnected: false, lastSeen: null });
        resetTelemetryData();
        clearTelemetryTimer();
      });

      socketRef.current = socket;
      socket.connect();
    } catch (e) {
      console.error("Connect error:", e);
      setWsStatus({ isConnected: false, isConnecting: false, connectionError: e instanceof Error ? e.message : "Connection failed" });
      updateDeviceStatus(selectedDeviceId, { isConnected: false, lastSeen: null });
      resetTelemetryData();
    }
  }, [availableDevices, selectedDeviceId, resetTelemetryData, updateDeviceStatus]);


  const publishMode = useCallback(
    (mode: "auto" | "manual") => {
      if (socketRef.current && wsStatus.isConnected && selectedDeviceId) {
        socketRef.current.emit("devices/command/mode", { deviceKey: selectedDeviceId, mode: mode === "manual" ? "MANUAL" : "AUTO" });
        setTelemetryData((prev) => ({ ...prev, mode }));
      }
    },
    [wsStatus.isConnected, selectedDeviceId]
  );

  const publishServo = useCallback(
    (cmd: "open" | "close") => {
      if (socketRef.current && wsStatus.isConnected && selectedDeviceId) {
        socketRef.current.emit("devices/command/servo", { deviceKey: selectedDeviceId, cmd: cmd === "open" ? "OPEN" : "CLOSE" });
        console.log(`Servo command sent: ${cmd}`);
      }
    },
    [wsStatus.isConnected, selectedDeviceId]
  );


  useEffect(() => {
    
    if (socketRef.current) {
      try {
        socketRef.current.disconnect();
      } catch {
        // ignore
      }
      socketRef.current = null;
    }

    setWsStatus({ isConnected: false, isConnecting: false, connectionError: null });
    resetTelemetryData();

    
    if (selectedDeviceId) {
      setDeviceStatuses((prev) => {
        const typedPrev = prev as Record<string, DeviceStatus>;
        const existing = typedPrev[selectedDeviceId] as DeviceStatus | undefined;
        if (existing) return prev;
        return { ...typedPrev, [selectedDeviceId]: { isConnected: false, lastSeen: null } };
      });
    }

    return () => {
      if (socketRef.current) {
        try {
          socketRef.current.disconnect();
        } catch {
          // ignore
        }
        socketRef.current = null;
      }
    };
  }, [selectedDeviceId, resetTelemetryData]);

  useEffect(() => {
    if (wsStatus.connectionError) {
      const timer = setTimeout(() => {
        setWsStatus((prev) => ({ ...prev, connectionError: null }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [wsStatus.connectionError]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        try {
          socketRef.current.disconnect();
        } catch {
          // ignore
        }
        socketRef.current = null;
      }
    };
  }, []);

  const connectToDevice = useCallback(() => {
    if (!selectedDeviceId) return;
    setWsStatus((prev) => ({ ...prev, connectionError: null }));
    connectWS();
  }, [connectWS, selectedDeviceId]);

  const disconnectFromDevice = useCallback(() => {
    if (socketRef.current) {
      try {
        socketRef.current.disconnect();
      } catch {
        // ignore
      }
      socketRef.current = null;
    }
    if (selectedDeviceId) {
      updateDeviceStatus(selectedDeviceId, { isConnected: false, lastSeen: null });
    }
    setWsStatus({ isConnected: false, isConnecting: false, connectionError: null });
    resetTelemetryData();
  }, [resetTelemetryData, selectedDeviceId, updateDeviceStatus]);

  return (
    <WsContext.Provider
      value={{
        selectedDeviceId,
        setSelectedDeviceId,
        availableDevices,
        deviceStatuses,
        updateDeviceStatus,
        getSelectedDeviceConfig,
        wsStatus,
        updateWsStatus,
        telemetryData,
        updateTelemetryData,
        connectToDevice,
        disconnectFromDevice,
        publishMode,
        publishServo,
      }}
    >
      {children}
    </WsContext.Provider>
  );
};

export const useWs = () => {
  const context = useContext(WsContext);
  if (context === undefined) {
    throw new Error("useWs must be used within a WsProvider");
  }
  return context;
};
