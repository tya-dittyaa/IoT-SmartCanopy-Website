import axios from "../lib/axios";
import type { DeviceDto } from "../types/device";

export async function fetchDevices(): Promise<DeviceDto[]> {
  const res = await axios.get<DeviceDto[]>("/devices");
  return res.data ?? [];
}
