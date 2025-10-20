/* eslint-disable react-refresh/only-export-components */
import mqtt, { type MqttClient } from "mqtt";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { fetchDevices } from "../api/devices";
import type { Device } from "../types/device";

const TELEMETRY_TIMEOUT = 120_000;

function disconnectMqtt(c?: MqttClient | null) {
  if (!c) return;
  try {
    c.end(true);
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
  mqttStatus: DeviceConnectionStatus;
  updateMqttStatus: (status: DeviceConnectionStatus) => void;
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
  const [mqttStatus, setMqttStatus] = useState<DeviceConnectionStatus>({
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
  const socketRef = useRef<MqttClient | null>(null);
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

  const updateMqttStatus = useCallback(
    (status: DeviceConnectionStatus) => setMqttStatus(status),
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

  const connectMQTT = useCallback(() => {
    // Use MQTT over WebSocket as the underlying transport.
    if (socketRef.current) return;

    setMqttStatus({
      isConnected: false,
      isConnecting: true,
      connectionError: null,
    });
    resetTelemetryData();

    const brokerUrl =
      (import.meta.env.VITE_MQTT_BROKER_URL as string | undefined) ??
      (window.location.origin.startsWith("http")
        ? window.location.origin.replace(/^http/, "ws")
        : "ws://localhost:8080");

    let telemetryTimer: number | null = null;
    const clearTelemetryTimer = () => {
      if (telemetryTimer) {
        window.clearTimeout(telemetryTimer);
        telemetryTimer = null;
      }
    };

    const markNoTelemetry = () => {
      const monitoringId = monitoringDeviceIdRef.current;
      if (monitoringId) {
        updateDeviceStatus(monitoringId, {
          isConnected: false,
          lastSeen: null,
        });
      }

      setMqttStatus((prev) => ({
        ...prev,
        isConnecting: false,
        connectionError: "No telemetry received for 2 minutes",
      }));
    };

    try {
      const client = mqtt.connect(brokerUrl, {
        // enable auto reconnection
        reconnectPeriod: 1000,
        clientId: `smartcanopy-web-client-${Math.random()
          .toString(16)
          .slice(3)}`,
      });

      client.on("connect", () => {
        // subscribe to wildcard telemetry topic
        client.subscribe("mqtt/devices/+/telemetry", (err) => {
          if (err) {
            setMqttStatus({
              isConnected: false,
              isConnecting: false,
              connectionError: String(err),
            });
            return;
          }

          setMqttStatus((prev) => ({
            ...prev,
            isConnected: true,
            isConnecting: false,
            connectionError: null,
            lastConnected: Date.now(),
          }));

          // mark device connected if we are monitoring one
          const monitoringId = monitoringDeviceIdRef.current;
          if (monitoringId) {
            updateDeviceStatus(monitoringId, {
              isConnected: true,
              lastSeen: Date.now(),
            });
          }

          clearTelemetryTimer();
          telemetryTimer = window.setTimeout(
            markNoTelemetry,
            TELEMETRY_TIMEOUT
          ) as unknown as number;
        });
      });

      client.on("message", (topic: string, message: Buffer) => {
        try {
          // topic: mqtt/devices/{deviceKey}/telemetry
          const parts = topic.split("/");
          // Expecting ['mqtt','devices','{deviceKey}','telemetry']
          if (parts.length < 4) return;
          const deviceKey = parts[2];

          if (
            !monitoringDeviceIdRef.current ||
            monitoringDeviceIdRef.current !== deviceKey
          )
            return;

          let raw: unknown;
          try {
            raw = JSON.parse(message.toString());
          } catch {
            // ignore non-json
            return;
          }

          const candidate =
            raw && typeof raw === "object"
              ? (raw as Record<string, unknown>)
              : undefined;
          const sensorObj = candidate?.sensorData ?? raw;
          const sensorData: Partial<ISensorTelemetry> | undefined =
            sensorObj && typeof sensorObj === "object"
              ? (sensorObj as Partial<ISensorTelemetry>)
              : undefined;

          if (!sensorData) return;

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
          console.error("Error handling MQTT message:", err);
        }
      });

      client.on("error", (err: Error) => {
        console.error("MQTT client error", err?.message ?? err);
        setMqttStatus({
          isConnected: false,
          isConnecting: false,
          connectionError: err?.message ?? String(err),
        });
        resetTelemetryData();
        clearTelemetryTimer();
      });

      client.on("close", () => {
        setMqttStatus((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          connectionError: "Disconnected",
        }));
        const monitoringId = monitoringDeviceIdRef.current;
        if (monitoringId)
          updateDeviceStatus(monitoringId, {
            isConnected: false,
            lastSeen: null,
          });
        resetTelemetryData();
        clearTelemetryTimer();
      });

      socketRef.current = client;
    } catch (e) {
      console.error("MQTT connect error:", e);
      setMqttStatus({
        isConnected: false,
        isConnecting: false,
        connectionError: e instanceof Error ? e.message : "Connection failed",
      });
      const monitoringId = monitoringDeviceIdRef.current;
      if (monitoringId)
        updateDeviceStatus(monitoringId, {
          isConnected: false,
          lastSeen: null,
        });
      resetTelemetryData();
    }
  }, [resetTelemetryData, updateDeviceStatus]);

  const publishMode = useCallback(
    (mode: "auto" | "manual") => {
      if (socketRef.current && mqttStatus.isConnected && selectedDeviceId) {
        const topic = `mqtt/devices/${selectedDeviceId}/command/mode`;
        const payload = JSON.stringify({
          deviceKey: selectedDeviceId,
          mode: mode === "manual" ? "MANUAL" : "AUTO",
        });
        try {
          socketRef.current.publish(topic, payload);
          setTelemetryData((prev) => ({ ...prev, mode }));
        } catch (err) {
          console.error("Publish mode error:", err);
        }
      }
    },
    [mqttStatus.isConnected, selectedDeviceId]
  );

  const publishServo = useCallback(
    (cmd: "open" | "close") => {
      if (socketRef.current && mqttStatus.isConnected && selectedDeviceId) {
        const topic = `mqtt/devices/${selectedDeviceId}/command/servo`;
        const payload = JSON.stringify({
          deviceKey: selectedDeviceId,
          cmd: cmd === "open" ? "OPEN" : "CLOSE",
        });
        try {
          socketRef.current.publish(topic, payload);
          console.log(`Servo command sent: ${cmd}`);
        } catch (err) {
          console.error("Publish servo error:", err);
        }
      }
    },
    [mqttStatus.isConnected, selectedDeviceId]
  );

  useEffect(() => {
    setMqttStatus((prev) => ({ ...prev, connectionError: null }));
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
    if (mqttStatus.connectionError) {
      const timer = setTimeout(() => {
        setMqttStatus((prev) => ({ ...prev, connectionError: null }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mqttStatus.connectionError]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        try {
          disconnectMqtt(socketRef.current);
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
    setMqttStatus((prev) => ({ ...prev, connectionError: null }));
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
    setMqttStatus((prev) => ({ ...prev, connectionError: null }));
    resetTelemetryData();
  }, [resetTelemetryData, selectedDeviceId, updateDeviceStatus]);

  useEffect(() => {
    connectMQTT();
    return () => {
      if (socketRef.current) {
        try {
          disconnectMqtt(socketRef.current);
        } catch {
          // ignore
        }
        socketRef.current = null;
      }
    };
  }, [connectMQTT]);

  return (
    <DeviceContext.Provider
      value={{
        selectedDeviceId,
        setSelectedDeviceId,
        availableDevices,
        updateDeviceStatus,
        getSelectedDevice,
        mqttStatus,
        updateMqttStatus,
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
