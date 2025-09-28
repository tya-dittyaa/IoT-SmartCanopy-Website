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
    name: "Raph ESP32 Device",
    deviceId: "raph_device",
    url: "ws://localhost:9001",
  },
];
