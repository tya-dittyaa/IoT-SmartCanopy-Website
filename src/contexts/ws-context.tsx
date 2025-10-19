/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";
import { fetchDevices } from "../api/devices";
import type { Device } from "../types/device";

const TELEMETRY_TIMEOUT = 120_000;

function disconnectSocket(s?: Socket | null) {
  if (!s) return;
  try {
    s.disconnect();
  } catch (e) {
    void e;
  }
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
  availableDevices: Device[];
  updateDeviceStatus: (deviceId: string, status: Partial<Device>) => void;
  getSelectedDevice: () => Device | undefined;
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
  const [wsStatus, setWsStatus] = useState<WSConnectionStatus>({
    isConnected: false,
    isConnecting: false,
    connectionError: null,
  });
  const [telemetryData, setTelemetryData] = useState<TelemetryData>({
    temperature: null,
    humidity: null,
    rainStatus: "unknown",
    servoStatus: "unknown",
    mode: "unknown",
  });
  const socketRef = useRef<Socket | null>(null);
  const [availableDevicesState, setAvailableDevicesState] = useState<Device[]>(
    []
  );
  const availableDevices = availableDevicesState;

  const resetTelemetryData = useCallback(() => {
    setTelemetryData({
      temperature: null,
      humidity: null,
      rainStatus: "unknown",
      servoStatus: "unknown",
      mode: "unknown",
    });
  }, []);

  const updateDeviceStatus = useCallback(
    (deviceId: string, status: Partial<Device>) => {
      setAvailableDevicesState((prev) =>
        prev.map((item) =>
          item.deviceId === deviceId ? { ...item, ...status } : item
        )
      );
    },
    []
  );

  const updateWsStatus = useCallback(
    (status: WSConnectionStatus) => setWsStatus(status),
    []
  );

  const updateTelemetryData = useCallback(
    (data: TelemetryData) => setTelemetryData(data),
    []
  );

  const getSelectedDevice = useCallback((): Device | undefined => {
    return availableDevices.find(
      (device) => device.deviceId === selectedDeviceId
    );
  }, [availableDevices, selectedDeviceId]);

  useEffect(() => {
    let aborted = false;
    const loadDevices = async () => {
      try {
        const data = await fetchDevices();
        if (aborted) return;
        if (Array.isArray(data)) {
          const configs: Device[] = data
            .map((d) => ({
              name: d.deviceName ?? "unknown",
              deviceId: d.deviceKey ?? d.id,
              isConnected: false,
              lastSeen: null,
            }))
            .filter(
              (c) => c.deviceId && typeof c.deviceId === "string"
            ) as Device[];
          if (configs.length > 0) setAvailableDevicesState(configs);
        }
      } catch (e) {
        console.error("Error fetching devices:", e);
      }
    };
    loadDevices();
    return () => {
      aborted = true;
    };
  }, []);

  const connectWS = useCallback(() => {
    if (!selectedDeviceId) return;
    const deviceItem = availableDevices.find(
      (d) => d.deviceId === selectedDeviceId
    );
    if (!deviceItem) return;
    if (socketRef.current && socketRef.current.active) return;

    setWsStatus({
      isConnected: false,
      isConnecting: true,
      connectionError: null,
    });
    resetTelemetryData();

    if (socketRef.current) {
      disconnectSocket(socketRef.current);
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
      updateDeviceStatus(selectedDeviceId, {
        isConnected: false,
        lastSeen: null,
      });
      setWsStatus({
        isConnected: false,
        isConnecting: false,
        connectionError: "No telemetry received for 2 minutes",
      });
      if (socketRef.current) {
        disconnectSocket(socketRef.current);
        socketRef.current = null;
      }
    };

    try {
      const socketUrl =
        (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
        window.location.origin;
      const socket = io(socketUrl, {
        autoConnect: false,
        transports: ["websocket"],
      });

      socket.on("connect", () => {
        updateDeviceStatus(selectedDeviceId, {
          isConnected: true,
          lastSeen: Date.now(),
        });
        setWsStatus({
          isConnected: true,
          isConnecting: false,
          connectionError: null,
        });
        clearTelemetryTimer();
        telemetryTimer = window.setTimeout(
          markNoTelemetry,
          TELEMETRY_TIMEOUT
        ) as unknown as number;
      });

      socket.on(
        "devices/telemetry",
        (payload: {
          deviceKey?: string;
          sensorData?: ISensorTelemetry | null;
        }) => {
          try {
            if (!payload) return;
            const { deviceKey, sensorData } = payload;
            if (!deviceKey || !sensorData) return;
            if (deviceKey !== selectedDeviceId) return;

            setTelemetryData((prev) => ({
              ...prev,
              ...(sensorData.temperature !== undefined && {
                temperature: Number(sensorData.temperature),
              }),
              ...(sensorData.humidity !== undefined && {
                humidity: Number(sensorData.humidity),
              }),
              ...(sensorData.rainStatus !== undefined && {
                rainStatus: sensorData.rainStatus === "RAIN" ? "rain" : "dry",
              }),
              ...(sensorData.servoStatus !== undefined && {
                servoStatus:
                  sensorData.servoStatus === "OPEN" ? "open" : "closed",
              }),
              ...(sensorData.mode !== undefined && {
                mode: sensorData.mode === "MANUAL" ? "manual" : "auto",
              }),
            }));

            updateDeviceStatus(selectedDeviceId, {
              isConnected: true,
              lastSeen: Date.now(),
            });
            clearTelemetryTimer();
            telemetryTimer = window.setTimeout(
              markNoTelemetry,
              TELEMETRY_TIMEOUT
            ) as unknown as number;
          } catch (err) {
            console.error("Error handling telemetry payload:", err);
          }
        }
      );

      socket.on("connect_error", (err: Error) => {
        console.error("Socket connect_error", err);
        setWsStatus({
          isConnected: false,
          isConnecting: false,
          connectionError: err.message || "Connection failed",
        });
        updateDeviceStatus(selectedDeviceId, {
          isConnected: false,
          lastSeen: null,
        });
        resetTelemetryData();
        clearTelemetryTimer();
        if (socketRef.current) {
          try {
            socketRef.current.disconnect();
          } catch (e) {
            void e;
          }
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
        setWsStatus({
          isConnected: false,
          isConnecting: false,
          connectionError: message,
        });
        updateDeviceStatus(selectedDeviceId, {
          isConnected: false,
          lastSeen: null,
        });
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
        setWsStatus({
          isConnected: false,
          isConnecting: false,
          connectionError: `Disconnected: ${reason}`,
        });
        updateDeviceStatus(selectedDeviceId, {
          isConnected: false,
          lastSeen: null,
        });
        resetTelemetryData();
        clearTelemetryTimer();
      });

      socketRef.current = socket;
      socket.connect();
    } catch (e) {
      console.error("Connect error:", e);
      setWsStatus({
        isConnected: false,
        isConnecting: false,
        connectionError: e instanceof Error ? e.message : "Connection failed",
      });
      updateDeviceStatus(selectedDeviceId, {
        isConnected: false,
        lastSeen: null,
      });
      resetTelemetryData();
    }
  }, [
    availableDevices,
    selectedDeviceId,
    resetTelemetryData,
    updateDeviceStatus,
  ]);

  const publishMode = useCallback(
    (mode: "auto" | "manual") => {
      if (socketRef.current && wsStatus.isConnected && selectedDeviceId) {
        socketRef.current.emit("devices/command/mode", {
          deviceKey: selectedDeviceId,
          mode: mode === "manual" ? "MANUAL" : "AUTO",
        });
        setTelemetryData((prev) => ({ ...prev, mode }));
      }
    },
    [wsStatus.isConnected, selectedDeviceId]
  );

  const publishServo = useCallback(
    (cmd: "open" | "close") => {
      if (socketRef.current && wsStatus.isConnected && selectedDeviceId) {
        socketRef.current.emit("devices/command/servo", {
          deviceKey: selectedDeviceId,
          cmd: cmd === "open" ? "OPEN" : "CLOSE",
        });
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

    setWsStatus({
      isConnected: false,
      isConnecting: false,
      connectionError: null,
    });
    resetTelemetryData();

    if (selectedDeviceId) {
      setAvailableDevicesState((prev) => {
        if (prev.find((d) => d.deviceId === selectedDeviceId)) return prev;
        return [
          ...prev,
          {
            name: "unknown",
            deviceId: selectedDeviceId,
            isConnected: false,
            lastSeen: null,
          },
        ];
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
    if (selectedDeviceId)
      updateDeviceStatus(selectedDeviceId, {
        isConnected: false,
        lastSeen: null,
      });
    setWsStatus({
      isConnected: false,
      isConnecting: false,
      connectionError: null,
    });
    resetTelemetryData();
  }, [resetTelemetryData, selectedDeviceId, updateDeviceStatus]);

  return (
    <WsContext.Provider
      value={{
        selectedDeviceId,
        setSelectedDeviceId,
        availableDevices,
        updateDeviceStatus,
        getSelectedDevice,
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
