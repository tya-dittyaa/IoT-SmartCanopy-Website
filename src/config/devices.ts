export interface DeviceConfig {
  name: string;
  deviceId: string;
  url: string;
  username?: string;
  password?: string;
  ca?: string;
}

export const deviceConfigs: DeviceConfig[] = [
  {
    name: "Smart Canopy #1",
    deviceId: "smartcanopy-001",
    url: "ws://localhost:9001",
  },
];
