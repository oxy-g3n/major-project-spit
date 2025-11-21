'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProcessedSensorData } from '@/types/sensor';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { METRIC_COLORS } from '@/lib/constants';

interface TimeSeriesChartProps {
  data: ProcessedSensorData[];
  metric: keyof ProcessedSensorData;
  title: string;
}

export default function TimeSeriesChart({ data, metric, title }: TimeSeriesChartProps) {
  if (!data || data.length === 0) {
    return null;
  }
  
  // Group data by device
  const device1Data = data.filter(d => d.device_id === 'DEVICE_001');
  const device2Data = data.filter(d => d.device_id === 'DEVICE_002');
  const device3Data = data.filter(d => d.device_id === 'DEVICE_003');
  
  // Create combined dataset with unique timestamps
  const timestamps = [...new Set(data.map(d => `${d.date} ${d.time}`))].sort();
  
  const chartData = timestamps.map(timestamp => {
    const [date, time] = timestamp.split(' ');
    const d1 = device1Data.find(d => `${d.date} ${d.time}` === timestamp);
    const d2 = device2Data.find(d => `${d.date} ${d.time}` === timestamp);
    const d3 = device3Data.find(d => `${d.date} ${d.time}` === timestamp);
    
    return {
      time: time.substring(0, 5), // HH-MM
      device1: d1 ? Number(d1[metric]) : null,
      device2: d2 ? Number(d2[metric]) : null,
      device3: d3 ? Number(d3[metric]) : null,
    };
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="device1" 
              stroke="#3b82f6" 
              name="Device 1" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="device2" 
              stroke="#10b981" 
              name="Device 2" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="device3" 
              stroke="#f59e0b" 
              name="Device 3" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
