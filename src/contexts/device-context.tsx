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
  } catch {
    // ignore
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

export interface DeviceConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  lastConnected?: number | null;
}

export interface DeviceContextType {
  selectedDeviceId: string;
  setSelectedDeviceId: (deviceId: string) => void;
  availableDevices: Device[];
  updateDeviceStatus: (deviceId: string, status: Partial<Device>) => void;
  getSelectedDevice: () => Device | undefined;
  wsStatus: DeviceConnectionStatus;
  updateWsStatus: (status: DeviceConnectionStatus) => void;
  telemetryData: TelemetryData;
  updateTelemetryData: (data: TelemetryData) => void;
  connectToDevice: () => void;
  disconnectFromDevice: () => void;
  publishMode: (mode: "auto" | "manual") => void;
  publishServo: (cmd: "open" | "close") => void;
  refreshDevices: () => Promise<void>;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider = ({ children }: { children: ReactNode }) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [wsStatus, setWsStatus] = useState<DeviceConnectionStatus>({
    isConnected: false,
    isConnecting: false,
    connectionError: null,
    lastConnected: null,
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
    (status: DeviceConnectionStatus) => setWsStatus(status),
    []
  );

  const updateTelemetryData = useCallback(
    (data: TelemetryData) => setTelemetryData(data),
    []
  );

  const refreshDevices = useCallback(async () => {
    try {
      const data = await fetchDevices();
      if (!Array.isArray(data)) return;
      const configs: Device[] = data
        .map((d) => ({
          name: d.deviceName ?? "unknown",
          deviceId: d.deviceKey ?? d.id,
          isConnected:
            availableDevices.find((a) => a.deviceId === (d.deviceKey ?? d.id))
              ?.isConnected ?? false,
          lastSeen:
            availableDevices.find((a) => a.deviceId === (d.deviceKey ?? d.id))
              ?.lastSeen ?? null,
        }))
        .filter(
          (c) => c.deviceId && typeof c.deviceId === "string"
        ) as Device[];

      setAvailableDevicesState((prev) => {
        const byId = new Map(prev.map((p) => [p.deviceId, p]));
        for (const cfg of configs) {
          byId.set(cfg.deviceId, {
            ...byId.get(cfg.deviceId),
            ...cfg,
          } as Device);
        }
        return Array.from(byId.values());
      });
    } catch (e) {
      console.error("Error refreshing devices:", e);
    }
  }, [availableDevices]);

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

  const monitoringDeviceIdRef = useRef<string | null>(null);

  const connectWS = useCallback(() => {
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
      if (selectedDeviceId) {
        updateDeviceStatus(selectedDeviceId, {
          isConnected: false,
          lastSeen: null,
        });
      }

      setWsStatus((prev) => ({
        ...prev,
        isConnected: socketRef.current
          ? !!socketRef.current.connected
          : prev.isConnected,
        isConnecting: false,
        connectionError: "No telemetry received for 2 minutes",
      }));
    };

    try {
      const socketUrl =
        (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
        window.location.origin;
      const socket = io(`${socketUrl}/devices`, {
        transports: ["websocket"],
      });

      socket.on("connect", () => {
        if (
          monitoringDeviceIdRef.current &&
          selectedDeviceId === monitoringDeviceIdRef.current
        ) {
          updateDeviceStatus(selectedDeviceId, {
            isConnected: true,
            lastSeen: Date.now(),
          });
        }
        setWsStatus((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          connectionError: null,
          lastConnected: Date.now(),
        }));
        clearTelemetryTimer();
        telemetryTimer = window.setTimeout(
          markNoTelemetry,
          TELEMETRY_TIMEOUT
        ) as unknown as number;
      });

      socket.on(
        "telemetry",
        (payload: {
          deviceKey?: string;
          sensorData?: ISensorTelemetry | null;
        }) => {
          try {
            if (!payload) return;
            const { deviceKey, sensorData } = payload;
            if (!deviceKey || !sensorData) return;

            if (selectedDeviceId && deviceKey !== selectedDeviceId) return;

            if (
              !monitoringDeviceIdRef.current ||
              monitoringDeviceIdRef.current !== deviceKey
            )
              return;
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

            updateDeviceStatus(deviceKey, {
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

      const handleConnectionError = (message?: string) => {
        console.error("Socket connection failure", message ?? "");
        setWsStatus((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          connectionError: message ?? "Connection failed",
        }));
        if (selectedDeviceId)
          updateDeviceStatus(selectedDeviceId, {
            isConnected: false,
            lastSeen: null,
          });
        resetTelemetryData();
        clearTelemetryTimer();

        // Let socket.io's built-in reconnection handle retries.
      };

      socket.on("connect_error", (err: Error) => {
        // Let socket.io keep trying to reconnect. Update status only.
        handleConnectionError(err?.message ?? String(err));
      });

      socket.on("error", (err: unknown) => {
        let message = "Socket error";
        if (err && typeof err === "object") {
          const possible = err as { message?: unknown };
          if (possible.message) message = String(possible.message);
        } else if (err) {
          message = String(err);
        }
        // Update status but don't forcibly disconnect; let socket.io manage reconnection.
        handleConnectionError(message);
      });

      socket.on("disconnect", (reason: string) => {
        setWsStatus((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          connectionError: `Disconnected: ${reason}`,
        }));
        if (selectedDeviceId)
          updateDeviceStatus(selectedDeviceId, {
            isConnected: false,
            lastSeen: null,
          });
        resetTelemetryData();
        clearTelemetryTimer();
        // socket.io will attempt reconnection by default. We don't schedule manual reconnects.
      });

      socketRef.current = socket;
      // socket created with default options (autoConnect: true, reconnection: true)
      // so it will connect automatically.
    } catch (e) {
      console.error("Connect error:", e);
      setWsStatus({
        isConnected: false,
        isConnecting: false,
        connectionError: e instanceof Error ? e.message : "Connection failed",
      });
      if (selectedDeviceId)
        updateDeviceStatus(selectedDeviceId, {
          isConnected: false,
          lastSeen: null,
        });
      resetTelemetryData();

      // Let socket.io handle reconnect attempts; nothing to schedule here.
    }
  }, [selectedDeviceId, resetTelemetryData, updateDeviceStatus]);

  const publishMode = useCallback(
    (mode: "auto" | "manual") => {
      if (socketRef.current && wsStatus.isConnected && selectedDeviceId) {
        socketRef.current.emit("command/mode", {
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
        socketRef.current.emit("command/servo", {
          deviceKey: selectedDeviceId,
          cmd: cmd === "open" ? "OPEN" : "CLOSE",
        });
        console.log(`Servo command sent: ${cmd}`);
      }
    },
    [wsStatus.isConnected, selectedDeviceId]
  );

  useEffect(() => {
    setWsStatus((prev) => ({ ...prev, connectionError: null }));
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

    return undefined;
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
    monitoringDeviceIdRef.current = selectedDeviceId;
    setWsStatus((prev) => ({ ...prev, connectionError: null }));
    updateDeviceStatus(selectedDeviceId, {
      isConnected: true,
      lastSeen: Date.now(),
    });

    resetTelemetryData();
  }, [resetTelemetryData, selectedDeviceId, updateDeviceStatus]);

  const disconnectFromDevice = useCallback(() => {
    if (selectedDeviceId) {
      updateDeviceStatus(selectedDeviceId, {
        isConnected: false,
        lastSeen: null,
      });
      if (monitoringDeviceIdRef.current === selectedDeviceId)
        monitoringDeviceIdRef.current = null;
    }
    setWsStatus((prev) => ({ ...prev, connectionError: null }));
    resetTelemetryData();
  }, [resetTelemetryData, selectedDeviceId, updateDeviceStatus]);

  useEffect(() => {
    connectWS();
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
  }, [connectWS]);

  return (
    <DeviceContext.Provider
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
        refreshDevices,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error("useDevice must be used within a DeviceProvider");
  }
  return context;
};
