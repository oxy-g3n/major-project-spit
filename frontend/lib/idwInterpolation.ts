import { SENSOR_COORDS_ARRAY } from './constants';

export interface GridPoint {
  lat: number;
  lng: number;
  value: number;
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
function isInsidePolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [x, y] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    
    const intersect = ((yi > y) !== (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
}

/**
 * Generate heatmap grid using Inverse Distance Weighting (IDW)
 */
export function generateHeatmapGrid(
  sensors: { lat: number; lng: number; temp: number }[],
  resolution: number = 300,
  power: number = 2
): GridPoint[] {
  if (!sensors || sensors.length === 0) {
    return [];
  }
  
  // Calculate bounds
  const lats = sensors.map(s => s.lat);
  const lngs = sensors.map(s => s.lng);
  const bounds = {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs)
  };
  
  // Add padding
  const latPadding = (bounds.maxLat - bounds.minLat) * 0.1;
  const lngPadding = (bounds.maxLng - bounds.minLng) * 0.1;
  bounds.minLat -= latPadding;
  bounds.maxLat += latPadding;
  bounds.minLng -= lngPadding;
  bounds.maxLng += lngPadding;
  
  const latStep = (bounds.maxLat - bounds.minLat) / resolution;
  const lngStep = (bounds.maxLng - bounds.minLng) / resolution;
  
  const gridPoints: GridPoint[] = [];
  
  for (let i = 0; i < resolution; i++) {
    const lat = bounds.minLat + i * latStep;
    
    for (let j = 0; j < resolution; j++) {
      const lng = bounds.minLng + j * lngStep;
      
      // Check if inside polygon (sensors 1→2→3→1)
      if (!isInsidePolygon([lat, lng], SENSOR_COORDS_ARRAY)) {
        continue;
      }
      
      let weightSum = 0;
      let tempSum = 0;
      
      sensors.forEach(sensor => {
        const dist = Math.sqrt(
          Math.pow(lat - sensor.lat, 2) + Math.pow(lng - sensor.lng, 2)
        );
        const weight = 1 / Math.pow(Math.max(dist, 1e-10), power);
        
        weightSum += weight;
        tempSum += weight * sensor.temp;
      });
      
      gridPoints.push({
        lat,
        lng,
        value: tempSum / weightSum
      });
    }
  }
  
  return gridPoints;
}

/**
 * Get color for temperature value using a blue to red gradient
 */
export function getColorForTemperature(temp: number, minTemp: number, maxTemp: number): string {
  const normalized = (temp - minTemp) / (maxTemp - minTemp);
  
  // Blue to Red gradient
  if (normalized <= 0) return '#0000ff';
  if (normalized >= 1) return '#ff0000';
  
  // Blue -> Cyan -> Green -> Yellow -> Red
  if (normalized < 0.25) {
    const t = normalized / 0.25;
    return `rgb(0, ${Math.round(255 * t)}, 255)`;
  } else if (normalized < 0.5) {
    const t = (normalized - 0.25) / 0.25;
    return `rgb(0, 255, ${Math.round(255 * (1 - t))})`;
  } else if (normalized < 0.75) {
    const t = (normalized - 0.5) / 0.25;
    return `rgb(${Math.round(255 * t)}, 255, 0)`;
  } else {
    const t = (normalized - 0.75) / 0.25;
    return `rgb(255, ${Math.round(255 * (1 - t))}, 0)`;
  }
}
