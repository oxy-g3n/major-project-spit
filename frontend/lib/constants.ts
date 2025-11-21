// Firebase configuration and constants
export const FIREBASE_URL = process.env.NEXT_PUBLIC_FIREBASE_URL || 'https://major-project-d3e48-default-rtdb.asia-southeast1.firebasedatabase.app';

// Sensor coordinates (fixed locations)
export const SENSOR_COORDS = {
  DEVICE_001: { lat: 19.12472788735068, lng: 72.83437872855019 },
  DEVICE_002: { lat: 19.124989833718722, lng: 72.8363659669012 },
  DEVICE_003: { lat: 19.122903829356257, lng: 72.83612121915581 }
} as const;

export const SENSOR_COORDS_ARRAY: [number, number][] = [
  [19.12472788735068, 72.83437872855019],   // DEVICE_001
  [19.124989833718722, 72.8363659669012],   // DEVICE_002
  [19.122903829356257, 72.83612121915581]   // DEVICE_003
];

// Signal quality thresholds
export const MIN_RSSI = -80;
export const MIN_SNR = 5;

// Data refresh interval (5 minutes)
export const REFRESH_INTERVAL = 300000;

// Required device IDs
export const REQUIRED_DEVICES = ['DEVICE_001', 'DEVICE_002', 'DEVICE_003'] as const;

// Metrics to track
export const METRICS = ['bmp_temp_c', 'pressure_hpa', 'humidity_pct', 'heat_index'] as const;

export const METRIC_LABELS: Record<string, string> = {
  bmp_temp_c: 'Temperature (°C)',
  pressure_hpa: 'Pressure (hPa)',
  humidity_pct: 'Humidity (%)',
  heat_index: 'Heat Index'
};

export const METRIC_COLORS: Record<string, string> = {
  bmp_temp_c: '#ef4444',
  pressure_hpa: '#3b82f6',
  humidity_pct: '#10b981',
  heat_index: '#f59e0b'
};
