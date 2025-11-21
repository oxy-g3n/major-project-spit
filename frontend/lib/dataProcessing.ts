import { ProcessedSensorData, RawSensorRecord, SensorStatistics } from '@/types/sensor';
import { MIN_RSSI, MIN_SNR, REQUIRED_DEVICES, METRICS } from './constants';

/**
 * Calculate heat index using the formula from Python code
 * HI = T + 0.33*e - 5.358
 * where e = (H/100) * 6.112 * exp((17.62*T) / (243.12+T))
 */
export function calculateHeatIndex(temperature: number, humidity: number): number {
  const T = temperature;
  const H = humidity;
  
  // Calculate vapor pressure
  const e = (H / 100) * 6.112 * Math.exp((17.62 * T) / (243.12 + T));
  
  // Calculate heat index
  const heatIndex = T + (0.33 * e) - 5.358;
  
  return Math.round(heatIndex * 100) / 100;
}

/**
 * Calculate average of an array of numbers
 */
function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Process raw sensor data from Firebase
 */
export function processSensorData(rawData: any): ProcessedSensorData[] {
  const records: any[] = [];
  
  if (!rawData || typeof rawData !== 'object') {
    return [];
  }
  
  // Loop through devices
  for (const [deviceKey, deviceData] of Object.entries(rawData)) {
    if (typeof deviceData !== 'object' || deviceData === null) continue;
    
    // Loop through timestamps
    for (const [timestamp, record] of Object.entries(deviceData as any)) {
      if (typeof record !== 'object' || record === null) continue;
      
      const recordData = record as any;
      
      // No filtering - use all readings
      
      // Parse timestamp "18-11-2025_06-00-00"
      const [datePart, timePart] = timestamp.split('_');
      if (!datePart || !timePart) continue;
      
      const timeComponents = timePart.split('-');
      if (timeComponents.length < 2) continue;
      
      const [hh, mm] = timeComponents;
      const timeBucket = `${hh}-${mm}-00`;
      
      records.push({
        date: datePart,
        time: timeBucket,
        device_id: recordData.device_id || deviceKey,
        bmp_temp_c: parseFloat(recordData.bmp_temp_c) || 0,
        humidity_pct: parseFloat(recordData.humidity_pct) || 0,
        pressure_hpa: parseFloat(recordData.pressure_hpa) || 0
      });
    }
  }
  
  // No aggregation - use raw records
  // Calculate heat index for each record
  return records.map(record => ({
    ...record,
    heat_index: calculateHeatIndex(record.bmp_temp_c, record.humidity_pct)
  }));
}

/**
 * Aggregate records by date, time, and device_id
 */
function aggregateRecords(records: any[]): any[] {
  const grouped = new Map<string, any[]>();
  
  records.forEach(record => {
    const key = `${record.date}_${record.time}_${record.device_id}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(record);
  });
  
  return Array.from(grouped.values()).map(group => {
    const first = group[0];
    return {
      date: first.date,
      time: first.time,
      device_id: first.device_id,
      bmp_temp_c: average(group.map(r => r.bmp_temp_c)),
      humidity_pct: average(group.map(r => r.humidity_pct)),
      pressure_hpa: average(group.map(r => r.pressure_hpa))
    };
  });
}

/**
 * Filter data to only include timestamps where all 3 devices have readings
 */
export function filterCompleteTimestamps(data: ProcessedSensorData[]): ProcessedSensorData[] {
  const requiredDevices = new Set(REQUIRED_DEVICES);
  
  // Group by date_time
  const grouped = new Map<string, Set<string>>();
  data.forEach(row => {
    const key = `${row.date}_${row.time}`;
    if (!grouped.has(key)) {
      grouped.set(key, new Set());
    }
    grouped.get(key)!.add(row.device_id);
  });
  
  // Find valid timestamps (all 3 devices present)
  const validKeys = Array.from(grouped.entries())
    .filter(([_, devices]) => {
      return Array.from(requiredDevices).every(d => devices.has(d));
    })
    .map(([key, _]) => key);
  
  const validSet = new Set(validKeys);
  
  return data.filter(row => validSet.has(`${row.date}_${row.time}`));
}

/**
 * Calculate statistics for all metrics
 */
export function calculateStatistics(data: ProcessedSensorData[]): SensorStatistics[] {
  if (!data || data.length === 0) {
    return [];
  }
  
  return METRICS.map(metric => {
    const values = data.map(d => d[metric as keyof ProcessedSensorData] as number);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    
    const minRow = data.find(d => d[metric as keyof ProcessedSensorData] === minVal);
    const maxRow = data.find(d => d[metric as keyof ProcessedSensorData] === maxVal);
    
    const avg = average(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    
    return {
      metric,
      average: Math.round(avg * 100) / 100,
      min_value: Math.round(minVal * 100) / 100,
      max_value: Math.round(maxVal * 100) / 100,
      time_at_min: minRow ? `${minRow.time}` : 'N/A',
      time_at_max: maxRow ? `${maxRow.time}` : 'N/A',
      variance: Math.round(variance * 100) / 100,
      std_deviation: Math.round(Math.sqrt(variance) * 100) / 100
    };
  });
}

/**
 * Convert time string to minutes from midnight
 */
function timeToMinutes(timeStr: string): number {
  const parts = timeStr.replace(/-/g, ':').split(':');
  if (parts.length < 2) return 0;
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

/**
 * Predict temperature at a specific time using cosine formula
 * T(t) = A * cos(2*pi*(t - tpeak)/1440) + Tavg
 */
export function predictTemperature(
  data: ProcessedSensorData[], 
  targetTime: string
): number | null {
  if (!data || data.length === 0) return null;
  
  const temps = data.map(d => d.bmp_temp_c);
  
  const T_max = Math.max(...temps);
  const T_min = Math.min(...temps);
  const T_avg = average(temps);
  
  const A = (T_max - T_min) / 2;
  
  // Find time of peak temperature
  const peakRow = data.find(d => d.bmp_temp_c === T_max);
  if (!peakRow) return null;
  
  const t_peak = timeToMinutes(peakRow.time);
  const t = timeToMinutes(targetTime);
  
  // T(t) = A * cos(2*pi*(t - tpeak)/1440) + Tavg
  const radians = (2 * Math.PI * (t - t_peak)) / 1440;
  const predicted = A * Math.cos(radians) + T_avg;
  
  return Math.round(predicted * 100) / 100;
}

/**
 * Get data sampled evenly (for chatbot context)
 */
export function sampleData(data: ProcessedSensorData[], maxRows: number = 50): ProcessedSensorData[] {
  if (data.length <= maxRows) return data;
  
  const step = Math.floor(data.length / maxRows);
  const sampled: ProcessedSensorData[] = [];
  
  for (let i = 0; i < data.length; i += step) {
    if (sampled.length >= maxRows) break;
    sampled.push(data[i]);
  }
  
  return sampled;
}
