'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import StatCards from '@/components/dashboard/StatCards';
import TimeSeriesChart from '@/components/dashboard/TimeSeriesChart';
import { ProcessedSensorData, SensorStatistics } from '@/types/sensor';
import { REFRESH_INTERVAL } from '@/lib/constants';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Dashboard() {
  const [statistics, setStatistics] = useState<SensorStatistics[]>([]);
  
  const { data, error, isLoading, mutate } = useSWR('/api/sensors', fetcher, {
    refreshInterval: REFRESH_INTERVAL,
    revalidateOnFocus: false
  });
  
  // Calculate statistics when data changes
  useEffect(() => {
    if (data?.data && data.data.length > 0) {
      fetch('/api/sensors/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: data.data })
      })
      .then(r => r.json())
      .then(result => {
        if (result.statistics) {
          setStatistics(result.statistics);
        }
      })
      .catch(err => console.error('Failed to calculate statistics:', err));
    }
  }, [data]);
  
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-4">{error.message || 'Failed to fetch sensor data'}</p>
            <Button onClick={() => mutate()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
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
  
  const sensorData: ProcessedSensorData[] = data.data || [];
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sensor Dashboard</h1>
          <p className="text-gray-600">
            Showing all {data.totalRecords || 0} raw sensor readings from 3 devices
          </p>
          <p className="text-sm text-gray-500 mt-1">
            No filtering applied - displaying all readings from Firebase
          </p>
          {data.timestamp && (
            <p className="text-sm text-gray-500">
              Last updated: {new Date(data.timestamp).toLocaleString()}
            </p>
          )}
        </div>
        <Button 
          onClick={() => mutate()} 
          variant="outline"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {statistics.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistics Overview</h2>
          <StatCards statistics={statistics} />
        </div>
      )}
      
      {sensorData.length > 0 && (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sensor Readings Over Time</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TimeSeriesChart 
                data={sensorData} 
                metric="bmp_temp_c" 
                title="Temperature (°C)" 
              />
              <TimeSeriesChart 
                data={sensorData} 
                metric="humidity_pct" 
                title="Humidity (%)" 
              />
              <TimeSeriesChart 
                data={sensorData} 
                metric="pressure_hpa" 
                title="Pressure (hPa)" 
              />
              <TimeSeriesChart 
                data={sensorData} 
                metric="heat_index" 
                title="Heat Index" 
              />
            </div>
          </div>
        </>
      )}
      
      {sensorData.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-600">No sensor data available</p>
        </div>
      )}
    </div>
  );
}
