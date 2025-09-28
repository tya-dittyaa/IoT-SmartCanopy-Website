import mqtt, { MqttClient } from "mqtt";
import { useEffect, useRef, useState } from "react";

export interface MQTTConfig {
  url: string;
  deviceId: string;
  username?: string;
  password?: string;
}

export interface TelemetryData {
  temperature: number | null;
  humidity: number | null;
  rainStatus: string;
  servoStatus: string;
  mode: "auto" | "manual" | "unknown";
}

export function useMQTT(externalConfig?: Partial<MQTTConfig>) {
  // Connection configuration
  const [config, setConfig] = useState<MQTTConfig>({
    url: "",
    deviceId: "",
  });

  // Use external config (overrides internal) when provided
  const effectiveConfig = externalConfig
    ? { ...config, ...externalConfig }
    : config;

  // Connection state
  const clientRef = useRef<MqttClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState<
    number | null
  >(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Telemetry state
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    temperature: null,
    humidity: null,
    rainStatus: "Unknown",
    servoStatus: "Unknown",
    mode: "unknown",
  });

  // Heartbeat monitoring
  const [lastHeartbeat, setLastHeartbeat] = useState<number | null>(null);
  const [awaitingHeartbeat, setAwaitingHeartbeat] = useState(false);
  const hbIntervalRef = useRef<number | null>(null);

  // Generate topic names based on device id
  const getTopics = () => {
    const topicBase = `devices/${effectiveConfig.deviceId}`;
    return {
      cmdMode: `${topicBase}/command/mode`,
      cmdServo: `${topicBase}/command/servo`,
      telemetry: `${topicBase}/telemetry`,
    };
  };

  // Reset telemetry and heartbeat state
  const resetTelemetry = () => {
    setTelemetry({
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
  };

  // Prevent reconnect spam by enforcing a cooldown
  const canReconnect = () => {
    if (!lastConnectionAttempt) return true;
    return Date.now() - lastConnectionAttempt > 3000;
  };

  // Connect to MQTT broker
  const connect = () => {
    if (!canReconnect()) {
      const remaining = Math.ceil(
        (3000 - (Date.now() - (lastConnectionAttempt || 0))) / 1000
      );
      setConnectionError(`Please wait ${remaining} seconds before retrying`);
      return;
    }

    setConnecting(true);
    setConnected(false);
    setConnectionError(null);
    setLastConnectionAttempt(Date.now());
    resetTelemetry();

    if (clientRef.current) {
      try {
        clientRef.current.end(true);
      } catch (e) {
        console.error("Error closing existing connection:", e);
      }
      clientRef.current = null;
    }

    // Connection timeout: give up if not connected within 10s
    const connectionTimeout = setTimeout(() => {
      if (connecting && !connected) {
        console.error("Connection timeout");
        setConnecting(false);
        setConnected(false);
        setConnectionError("Connection timeout");
        setLastConnectionAttempt(null);
        if (clientRef.current) {
          try {
            clientRef.current.end(true);
          } catch (e) {
            console.error("Error ending connection on timeout:", e);
          }
          clientRef.current = null;
        }
      }
    }, 10000); // 10 second timeout

    try {
      const client = mqtt.connect(effectiveConfig.url, {
        reconnectPeriod: 0,
        connectTimeout: 8000,
        keepalive: 60,
        clientId: `nextjs-client-${Math.random().toString(16).substr(2, 8)}`,
        ...(effectiveConfig.username && { username: effectiveConfig.username }),
        ...(effectiveConfig.password && { password: effectiveConfig.password }),
      });

      const topics = getTopics();

      client.on("connect", () => {
        clearTimeout(connectionTimeout);
        setConnected(true);
        setConnecting(false);
        setConnectionError(null);
        setAwaitingHeartbeat(true);
        setLastHeartbeat(null);

        // Subscribe to telemetry topic
        client.subscribe(topics.telemetry);
      });

      client.on("reconnect", () => {
        console.log("MQTT reconnecting...");
        setConnected(false);
        setConnecting(true);
      });

      client.on("error", (err: Error) => {
        console.error("MQTT error", err);
        clearTimeout(connectionTimeout);
        setConnected(false);
        setConnecting(false);
        setConnectionError(err.message || "Connection failed");
        resetTelemetry();
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
        const topics = getTopics();

        // update heartbeat timestamp
        setLastHeartbeat(now);
        if (awaitingHeartbeat) setAwaitingHeartbeat(false);

        // telemetry topic contains JSON with all sensor/state values
        if (topic === topics.telemetry) {
          try {
            const data = JSON.parse(msg);
            setTelemetry((prev) => ({
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
        setConnected(false);
        setConnecting(false);
        setLastConnectionAttempt(null);
        resetTelemetry();
      });

      client.on("offline", () => {
        console.log("MQTT offline");
        setConnected(false);
        setConnecting(false);
        setConnectionError("Connection offline");
        setLastConnectionAttempt(null);
        resetTelemetry();
      });

      clientRef.current = client;
    } catch (e) {
      console.error("Connect error:", e);
      clearTimeout(connectionTimeout);
      setConnecting(false);
      setConnected(false);
      setConnectionError(e instanceof Error ? e.message : "Connection failed");
      resetTelemetry();
    }
  };

  // Disconnect from MQTT broker
  const disconnect = () => {
    if (clientRef.current) {
      clientRef.current.end(true);
      clientRef.current = null;
    }
    setConnected(false);
    setConnecting(false);
    setConnectionError(null);
    setLastConnectionAttempt(null);
    resetTelemetry();
  };

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (connectionError) {
      const timer = setTimeout(() => {
        setConnectionError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [connectionError]);

  // Heartbeat monitoring effect
  useEffect(() => {
    if (!connected) {
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
        // Heartbeat timeout - disconnect and reset
        if (clientRef.current) {
          try {
            clientRef.current.end(true);
          } catch (err) {
            console.error("Error ending connection on heartbeat timeout:", err);
          }
          clientRef.current = null;
        }
        setConnected(false);
        setConnecting(false);
        setConnectionError("Connection lost");
        setLastConnectionAttempt(null);
        resetTelemetry();
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
  }, [connected, lastHeartbeat, awaitingHeartbeat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.end(true);
        clientRef.current = null;
      }
    };
  }, []);

  // Publish mode command
  const publishMode = (mode: "auto" | "manual") => {
    if (clientRef.current && connected) {
      const topics = getTopics();
      clientRef.current.publish(topics.cmdMode, mode, { qos: 0, retain: true });
      setTelemetry((prev) => ({ ...prev, mode }));
    }
  };

  // Publish servo command
  const publishServo = (cmd: "open" | "close") => {
    if (clientRef.current && connected) {
      const topics = getTopics();
      clientRef.current.publish(topics.cmdServo, cmd, { qos: 0 });
      setTelemetry((prev) => ({
        ...prev,
        servoStatus: cmd === "open" ? "Open" : "Closed",
      }));
    }
  };

  // Calculate heartbeat age in seconds
  const heartbeatAge = connecting
    ? 0
    : lastHeartbeat
    ? Math.max(0, Math.round((Date.now() - lastHeartbeat) / 1000))
    : null;

  return {
    // Configuration
    config,
    setConfig,

    // Connection state
    connected,
    connecting,
    connect,
    disconnect,
    connectionError,
    canReconnect: canReconnect(),

    // Telemetry data
    telemetry,

    // Heartbeat
    lastHeartbeat,
    heartbeatAge,
    awaitingHeartbeat,

    // Commands
    publishMode,
    publishServo,
  };
}
