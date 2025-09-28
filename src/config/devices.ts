export interface DeviceConfig {
  name: string;
  deviceId: string;
  url: string;
  username?: string;
  password?: string;
}

export const deviceConfigs: DeviceConfig[] = [
  {
    name: "Smart Canopy #1",
    deviceId: "smartcanopy-001",
    url: "ws://localhost:9001",
  },
  {
    name: "Smart Canopy #2",
    deviceId: "smartcanopy-002",
    url: "ws://localhost:9001",
  },
  {
    name: "Smart Canopy #3",
    deviceId: "smartcanopy-003",
    url: "ws://localhost:9002",
  },
];
