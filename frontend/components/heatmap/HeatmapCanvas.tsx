'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ProcessedSensorData } from '@/types/sensor';
import { SENSOR_COORDS } from '@/lib/constants';
import { generateHeatmapGrid, getColorForTemperature } from '@/lib/idwInterpolation';

interface HeatmapCanvasProps {
  data: ProcessedSensorData[];
  selectedTime: string;
}

export default function HeatmapCanvas({ data, selectedTime }: HeatmapCanvasProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const heatLayerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    // Calculate center of sensor coordinates
    const coords = Object.values(SENSOR_COORDS);
    const centerLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
    const centerLng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;
    
    // Initialize map
    const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 16);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    mapRef.current = map;
    heatLayerRef.current = L.layerGroup().addTo(map);
    markersRef.current = L.layerGroup().addTo(map);
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);
  
  useEffect(() => {
    if (!mapRef.current || !data || data.length === 0) return;
    
    // Filter data for selected time
    const timeData = data.filter(d => d.time === selectedTime);
    
    if (timeData.length === 0) return;
    
    // Clear existing layers
    if (heatLayerRef.current) {
      heatLayerRef.current.clearLayers();
    }
    if (markersRef.current) {
      markersRef.current.clearLayers();
    }
    
    // Prepare sensor data for heatmap
    const sensors = [
      {
        lat: SENSOR_COORDS.DEVICE_001.lat,
        lng: SENSOR_COORDS.DEVICE_001.lng,
        temp: timeData.find(d => d.device_id === 'DEVICE_001')?.bmp_temp_c || 0,
        device_id: 'DEVICE_001'
      },
      {
        lat: SENSOR_COORDS.DEVICE_002.lat,
        lng: SENSOR_COORDS.DEVICE_002.lng,
        temp: timeData.find(d => d.device_id === 'DEVICE_002')?.bmp_temp_c || 0,
        device_id: 'DEVICE_002'
      },
      {
        lat: SENSOR_COORDS.DEVICE_003.lat,
        lng: SENSOR_COORDS.DEVICE_003.lng,
        temp: timeData.find(d => d.device_id === 'DEVICE_003')?.bmp_temp_c || 0,
        device_id: 'DEVICE_003'
      }
    ];
    
    const temps = sensors.map(s => s.temp);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    
    // Generate heatmap grid
    const gridPoints = generateHeatmapGrid(sensors, 100);
    
    // Draw heatmap
    gridPoints.forEach(point => {
      const color = getColorForTemperature(point.value, minTemp, maxTemp);
      L.circle([point.lat, point.lng], {
        radius: 5,
        fillColor: color,
        fillOpacity: 0.6,
        stroke: false
      }).addTo(heatLayerRef.current!);
    });
    
    // Draw polygon boundary
    const polygonCoords: [number, number][] = [
      [SENSOR_COORDS.DEVICE_001.lat, SENSOR_COORDS.DEVICE_001.lng],
      [SENSOR_COORDS.DEVICE_002.lat, SENSOR_COORDS.DEVICE_002.lng],
      [SENSOR_COORDS.DEVICE_003.lat, SENSOR_COORDS.DEVICE_003.lng]
    ];
    
    L.polygon(polygonCoords, {
      color: 'black',
      weight: 2,
      fill: false
    }).addTo(heatLayerRef.current!);
    
    // Add sensor markers
    sensors.forEach(sensor => {
      L.circleMarker([sensor.lat, sensor.lng], {
        radius: 8,
        fillColor: 'red',
        color: 'white',
        weight: 2,
        fillOpacity: 1
      })
      .bindPopup(`
        <div class="text-sm">
          <strong>${sensor.device_id}</strong><br/>
          Temperature: ${sensor.temp.toFixed(2)}°C
        </div>
      `)
      .addTo(markersRef.current!);
    });
    
  }, [data, selectedTime]);
  
  return (
    <div ref={mapContainerRef} className="w-full h-full" />
  );
}
