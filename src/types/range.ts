// Shared range type and constants for telemetry charts
export const RANGES = ["15m", "30m", "1h", "6h", "1d", "7d"] as const;

export type Range = (typeof RANGES)[number];

// Map range to minutes helper
export const RANGE_TO_MINUTES: Record<Range, number> = {
  "15m": 15,
  "30m": 30,
  "1h": 60,
  "6h": 60 * 6,
  "1d": 60 * 24,
  "7d": 60 * 24 * 7,
};

export default RANGES;
