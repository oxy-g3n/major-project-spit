'use client';

import { SensorStatistics } from '@/types/sensor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { METRIC_LABELS } from '@/lib/constants';

interface DataSummaryProps {
  statistics: SensorStatistics[];
  recordCount: number;
}

export default function DataSummary({ statistics, recordCount }: DataSummaryProps) {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Sensor Data Context</h2>
        <p className="text-sm text-gray-600">
          The AI has access to current sensor statistics and readings.
        </p>
      </div>
      
      <Separator />
      
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Data Summary</h3>
          <Badge variant="secondary">{recordCount} records</Badge>
        </div>
        
        {statistics && statistics.length > 0 ? (
          <div className="space-y-3">
            {statistics.map((stat) => (
              <Card key={stat.metric} className="bg-gray-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-gray-600">
                    {METRIC_LABELS[stat.metric] || stat.metric}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg:</span>
                    <span className="font-semibold">{stat.average.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min:</span>
                    <span className="font-semibold">{stat.min_value.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max:</span>
                    <span className="font-semibold">{stat.max_value.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No statistics available</p>
        )}
      </div>
      
      <Separator />
      
      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Tip:</strong> Ask about temperature trends, anomalies, or device comparisons.</p>
        <p>Example: "What's the average temperature across all devices?"</p>
      </div>
    </div>
  );
}
