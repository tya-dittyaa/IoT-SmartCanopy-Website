/* eslint-disable react-refresh/only-export-components */
import mqtt, { type MqttClient } from "mqtt";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { DeviceConfig } from "../config/devices";
import { deviceConfigs } from "../config/devices";

export interface DeviceStatus {
  lastHeartbeat: number | null;
  isConnected: boolean;
}

export interface TelemetryData {
  temperature: number | null;
  humidity: number | null;
  rainStatus: string;
  servoStatus: string;
  mode: "auto" | "manual" | "unknown";
}

export interface MQTTConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
}

export interface MqttContextType {
  selectedDeviceId: string;
  setSelectedDeviceId: (deviceId: string) => void;
  availableDevices: DeviceConfig[];
  deviceStatuses: Record<string, DeviceStatus>;
  updateDeviceStatus: (deviceId: string, status: DeviceStatus) => void;
  getSelectedDeviceConfig: () => DeviceConfig | undefined;
  mqttStatus: MQTTConnectionStatus;
  updateMQTTStatus: (status: MQTTConnectionStatus) => void;
  telemetryData: TelemetryData;
  updateTelemetryData: (data: TelemetryData) => void;
  connectToDevice: () => void;
  disconnectFromDevice: () => void;
  shouldConnect: boolean;
  awaitingHeartbeat: boolean;
  publishMode: (mode: "auto" | "manual") => void;
  publishServo: (cmd: "open" | "close") => void;
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export const MqttProvider = ({ children }: { children: ReactNode }) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [deviceStatuses, setDeviceStatuses] = useState<
    Record<string, DeviceStatus>
  >({});
  const [shouldConnect, setShouldConnect] = useState<boolean>(false);
  const [mqttStatus, setMQTTStatus] = useState<MQTTConnectionStatus>({
    isConnected: false,
    isConnecting: false,
    connectionError: null,
  });
  const [telemetryData, setTelemetryData] = useState<TelemetryData>({
    temperature: null,
    humidity: null,
    rainStatus: "Unknown",
    servoStatus: "Unknown",
    mode: "unknown",
  });

  const clientRef = useRef<MqttClient | null>(null);
  const [lastHeartbeat, setLastHeartbeat] = useState<number | null>(null);
  const [awaitingHeartbeat, setAwaitingHeartbeat] = useState(false);
  const hbIntervalRef = useRef<number | null>(null);

  const availableDevices = deviceConfigs;

  const selectedDeviceConfig = useMemo((): DeviceConfig | undefined => {
    return availableDevices.find(
      (device) => device.deviceId === selectedDeviceId
    );
  }, [availableDevices, selectedDeviceId]);

  const getTopics = useCallback((deviceId: string) => {
    const topicBase = `devices/${deviceId}`;
    return {
      cmdMode: `${topicBase}/command/mode`,
      cmdServo: `${topicBase}/command/servo`,
      telemetry: `${topicBase}/telemetry`,
    };
  }, []);

  const resetTelemetryData = useCallback(() => {
    setTelemetryData({
      temperature: null,
      humidity: null,
      rainStatus: "Unknown",
      servoStatus: "Unknown",
      mode: "unknown",
    });
    setLastHeartbeat(null);
    setAwaitingHeartbeat(false);
    if (hbIntervalRef.current) {
      window.clearInterval(hbIntervalRef.current);
      hbIntervalRef.current = null;
    }
  }, []);

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

  const updateTelemetryData = useCallback((data: TelemetryData) => {
    setTelemetryData(data);
  }, []);

  const getSelectedDeviceConfig = useCallback((): DeviceConfig | undefined => {
    return availableDevices.find(
      (device) => device.deviceId === selectedDeviceId
    );
  }, [availableDevices, selectedDeviceId]);

  const connectMQTT = useCallback(() => {
    if (!selectedDeviceConfig) {
      console.error("No device selected for connection");
      return;
    }

    setMQTTStatus({
      isConnected: false,
      isConnecting: true,
      connectionError: null,
    });
    resetTelemetryData();

    if (clientRef.current) {
      try {
        clientRef.current.end(true);
      } catch (e) {
        console.error("Error closing existing connection:", e);
      }
      clientRef.current = null;
    }

    const connectionTimeout = setTimeout(() => {
      setMQTTStatus({
        isConnected: false,
        isConnecting: false,
        connectionError: "Connection timeout - Server not responding",
      });
      setShouldConnect(false);
      if (clientRef.current) {
        try {
          clientRef.current.end(true);
        } catch (e) {
          console.error("Error ending connection on timeout:", e);
        }
        clientRef.current = null;
      }
    }, 3000);

    try {
      const client = mqtt.connect(selectedDeviceConfig.url, {
        reconnectPeriod: 0,
        connectTimeout: 2000,
        keepalive: 60,
        clean: true,
        manualConnect: false,
        clientId: `web-client-${Math.random().toString(16).substr(2, 8)}`,
        ...(selectedDeviceConfig.username && {
          username: selectedDeviceConfig.username,
        }),
        ...(selectedDeviceConfig.password && {
          password: selectedDeviceConfig.password,
        }),
      });

      const topics = getTopics(selectedDeviceConfig.deviceId);

      client.on("connect", () => {
        clearTimeout(connectionTimeout);
        setMQTTStatus({
          isConnected: true,
          isConnecting: false,
          connectionError: null,
        });
        setAwaitingHeartbeat(true);
        setLastHeartbeat(null);
        client.subscribe(topics.telemetry);
      });

      client.on("error", (err: Error) => {
        console.error("MQTT error", err);
        clearTimeout(connectionTimeout);
        setMQTTStatus({
          isConnected: false,
          isConnecting: false,
          connectionError: err.message || "Connection failed",
        });
        setShouldConnect(false);
        resetTelemetryData();
        if (clientRef.current) {
          try {
            clientRef.current.end(true);
          } catch (e) {
            console.error("Error ending connection on error:", e);
          }
          clientRef.current = null;
        }
      });

      client.on("message", (topic: string, payload: Buffer) => {
        const msg = payload.toString();
        const now = Date.now();

        setLastHeartbeat(now);
        if (awaitingHeartbeat) setAwaitingHeartbeat(false);

        if (topic === topics.telemetry) {
          try {
            const data = JSON.parse(msg);
            setTelemetryData((prev) => ({
              ...prev,
              ...(data.temperature !== undefined && {
                temperature: Number(data.temperature),
              }),
              ...(data.humidity !== undefined && {
                humidity: Number(data.humidity),
              }),
              ...(data.rainStatus !== undefined && {
                rainStatus: data.rainStatus === "Rain" ? "Rain" : "No Rain",
              }),
              ...(data.servoStatus !== undefined && {
                servoStatus: data.servoStatus,
              }),
              ...(data.mode !== undefined && {
                mode: data.mode === "manual" ? "manual" : "auto",
              }),
            }));
          } catch (e) {
            console.error("Error parsing telemetry JSON:", e);
          }
        }
      });

      client.on("close", () => {
        clearTimeout(connectionTimeout);
        setMQTTStatus({
          isConnected: false,
          isConnecting: false,
          connectionError: "Connection closed",
        });
        setShouldConnect(false);
        resetTelemetryData();
      });

      client.on("offline", () => {
        setMQTTStatus({
          isConnected: false,
          isConnecting: false,
          connectionError: "Connection offline",
        });
        setShouldConnect(false);
        resetTelemetryData();
      });

      clientRef.current = client;
    } catch (e) {
      console.error("Connect error:", e);
      clearTimeout(connectionTimeout);
      setMQTTStatus({
        isConnected: false,
        isConnecting: false,
        connectionError: e instanceof Error ? e.message : "Connection failed",
      });
      setShouldConnect(false);
      resetTelemetryData();
    }
  }, [selectedDeviceConfig, getTopics, resetTelemetryData, awaitingHeartbeat]);

  const disconnectMQTT = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end(true);
      clientRef.current = null;
    }
    setMQTTStatus({
      isConnected: false,
      isConnecting: false,
      connectionError: null,
    });
    resetTelemetryData();
  }, [resetTelemetryData]);

  const publishMode = useCallback(
    (mode: "auto" | "manual") => {
      if (clientRef.current && mqttStatus.isConnected && selectedDeviceConfig) {
        const topics = getTopics(selectedDeviceConfig.deviceId);
        clientRef.current.publish(topics.cmdMode, mode, {
          qos: 0,
          retain: true,
        });
        setTelemetryData((prev) => ({ ...prev, mode }));
      }
    },
    [mqttStatus.isConnected, selectedDeviceConfig, getTopics]
  );

  const publishServo = useCallback(
    (cmd: "open" | "close") => {
      if (clientRef.current && mqttStatus.isConnected && selectedDeviceConfig) {
        const topics = getTopics(selectedDeviceConfig.deviceId);
        clientRef.current.publish(topics.cmdServo, cmd, { qos: 0 });
        setTelemetryData((prev) => ({
          ...prev,
          servoStatus: cmd === "open" ? "Open" : "Closed",
        }));
      }
    },
    [mqttStatus.isConnected, selectedDeviceConfig, getTopics]
  );

  useEffect(() => {
    if (
      shouldConnect &&
      selectedDeviceConfig &&
      !mqttStatus.isConnected &&
      !mqttStatus.isConnecting
    ) {
      connectMQTT();
    } else if (
      !shouldConnect &&
      (mqttStatus.isConnected || mqttStatus.isConnecting)
    ) {
      disconnectMQTT();
    }
  }, [
    shouldConnect,
    selectedDeviceConfig,
    mqttStatus.isConnected,
    mqttStatus.isConnecting,
    mqttStatus.connectionError,
    connectMQTT,
    disconnectMQTT,
  ]);

  useEffect(() => {
    if (mqttStatus.connectionError) {
      const timer = setTimeout(() => {
        setMQTTStatus((prev) => ({ ...prev, connectionError: null }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mqttStatus.connectionError]);

  useEffect(() => {
    if (!mqttStatus.isConnected) {
      if (hbIntervalRef.current) {
        window.clearInterval(hbIntervalRef.current);
        hbIntervalRef.current = null;
      }
      return;
    }

    hbIntervalRef.current = window.setInterval(() => {
      const now = Date.now();
      if (lastHeartbeat === null) return;

      if (now - lastHeartbeat > 30000) {
        if (clientRef.current) {
          try {
            clientRef.current.end(true);
          } catch (err) {
            console.error("Error ending connection on heartbeat timeout:", err);
          }
          clientRef.current = null;
        }
        setMQTTStatus({
          isConnected: false,
          isConnecting: false,
          connectionError: "Connection lost",
        });
        setShouldConnect(false);
        resetTelemetryData();
        if (hbIntervalRef.current) {
          window.clearInterval(hbIntervalRef.current);
          hbIntervalRef.current = null;
        }
      }
    }, 2000);

    return () => {
      if (hbIntervalRef.current) {
        window.clearInterval(hbIntervalRef.current);
        hbIntervalRef.current = null;
      }
    };
  }, [
    mqttStatus.isConnected,
    lastHeartbeat,
    awaitingHeartbeat,
    resetTelemetryData,
  ]);

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.end(true);
        clientRef.current = null;
      }
    };
  }, []);

  const connectToDevice = useCallback(() => {
    if (selectedDeviceId) {
      setMQTTStatus((prev) => ({
        ...prev,
        connectionError: null,
      }));
      setShouldConnect(true);
    }
  }, [selectedDeviceId]);

  const disconnectFromDevice = useCallback(() => {
    setShouldConnect(false);
  }, []);

  return (
    <MqttContext.Provider
      value={{
        selectedDeviceId,
        setSelectedDeviceId,
        availableDevices,
        deviceStatuses,
        updateDeviceStatus,
        getSelectedDeviceConfig,
        mqttStatus,
        updateMQTTStatus,
        telemetryData,
        updateTelemetryData,
        connectToDevice,
        disconnectFromDevice,
        shouldConnect,
        awaitingHeartbeat,
        publishMode,
        publishServo,
      }}
    >
      {children}
    </MqttContext.Provider>
  );
};

export const useMqtt = () => {
  const context = useContext(MqttContext);
  if (context === undefined) {
    throw new Error("useMqtt must be used within a MqttProvider");
  }
  return context;
};
