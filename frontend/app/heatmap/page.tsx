'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import TimeSlider from '@/components/heatmap/TimeSlider';
import { AlertCircle } from 'lucide-react';

const HeatmapCanvas = dynamic(
  () => import('@/components/heatmap/HeatmapCanvas'),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function HeatmapPage() {
  const { data, error, isLoading } = useSWR('/api/heatmap-data', fetcher);
  const [selectedTime, setSelectedTime] = useState<string>('12-00-00');
  
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
            <p className="text-gray-600">{error.message || 'Failed to fetch sensor data'}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (isLoading || !data) {
    return (
      <div className="container mx-auto p-6">
        <LoadingSpinner />
      </div>
    );
  }
  
  const uniqueTimes = [...new Set(data.data?.map((d: any) => d.time))].sort() as string[];
  
  // Set initial time if not set
  if (uniqueTimes.length > 0 && !uniqueTimes.includes(selectedTime)) {
    const middleIndex = Math.floor(uniqueTimes.length / 2);
    setSelectedTime(uniqueTimes[middleIndex] as string);
  }
  
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="bg-white shadow-sm border-b p-4">
        <div className="container mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Temperature Heatmap</h1>
              <p className="text-sm text-gray-600 mt-1">
                Using 24-hour CSV data: {data?.totalRecords || 0} readings across {uniqueTimes.length} time points
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Data source: sensor_data_24h_transformed.csv
              </p>
            </div>
          </div>
          
          {uniqueTimes.length > 0 && (
            <div className="max-w-2xl">
              <TimeSlider
                times={uniqueTimes}
                value={selectedTime}
                onChange={setSelectedTime}
              />
              <p className="text-xs text-gray-500 mt-2">
                Currently viewing: <span className="font-semibold">{selectedTime.substring(0, 5)}</span> - Temperature readings from all 3 devices at this time are interpolated across the sensor area
              </p>
            </div>
          )}
          
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">Cold</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-gray-600">Warm</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-gray-600">Hot</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1">
        {data.data && data.data.length > 0 ? (
          <HeatmapCanvas
            data={data.data}
            selectedTime={selectedTime}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">No sensor data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
