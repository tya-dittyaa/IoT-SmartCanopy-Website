import axios from "@/lib/axios";
import type { TelemetryDto } from "@/types/telemetry";

export async function fetchTemperatureTelemetry(
  deviceKey: string,
  minutes = 1000
) {
  const res = await axios.get<TelemetryDto[]>("/telemetries/temperature", {
    params: { deviceKey, minutes },
  });
  return res.data ?? [];
}

export async function fetchHumidityTelemetry(
  deviceKey: string,
  minutes = 1000
) {
  const res = await axios.get<TelemetryDto[]>("/telemetries/humidity", {
    params: { deviceKey, minutes },
  });
  return res.data ?? [];
}

export async function fetchLightTelemetry(deviceKey: string, minutes = 1000) {
  const res = await axios.get<TelemetryDto[]>("/telemetries/light", {
    params: { deviceKey, minutes },
  });
  return res.data ?? [];
}

export async function fetchRainTelemetry(deviceKey: string, minutes = 1000) {
  const res = await axios.get<TelemetryDto[]>("/telemetries/rain", {
    params: { deviceKey, minutes },
  });
  return res.data ?? [];
}

export async function fetchServoTelemetry(deviceKey: string, minutes = 1000) {
  const res = await axios.get<TelemetryDto[]>("/telemetries/servo", {
    params: { deviceKey, minutes },
  });
  return res.data ?? [];
}
