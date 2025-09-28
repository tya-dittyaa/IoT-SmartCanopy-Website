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
    url: "ws://192.168.138.82:9001/mqtt",
  },
];
