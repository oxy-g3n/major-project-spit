export interface RawSensorRecord {
  rssi: number;
  snr: number;
  bmp_temp_c: number;
  humidity_pct: number;
  pressure_hpa: number;
  device_id: string;
  timestamp?: string;
}

export interface ProcessedSensorData {
  date: string;
  time: string;
  device_id: string;
  bmp_temp_c: number;
  humidity_pct: number;
  pressure_hpa: number;
  heat_index: number;
}

export interface SensorStatistics {
  metric: string;
  average: number;
  min_value: number;
  max_value: number;
  time_at_min: string;
  time_at_max: string;
  variance: number;
  std_deviation: number;
}

export interface SensorCoordinate {
  lat: number;
  lng: number;
  temp: number;
  device_id: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface HeatmapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}
