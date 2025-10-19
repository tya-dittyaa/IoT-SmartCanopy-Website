export type TelemetryDto = {
  time: string; // ISO timestamp
  value: number;
};

export type TelemetryPoint = {
  time: string; // formatted for charts (e.g. 'HH:mm')
  value: number;
};
