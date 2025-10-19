export interface DeviceDto {
  id: string;
  deviceKey: string;
  deviceName: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Device {
  name: string;
  deviceId: string;
  isConnected: boolean;
  lastSeen: number | null;
}
