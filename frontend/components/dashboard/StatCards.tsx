'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SensorStatistics } from '@/types/sensor';
import { METRIC_LABELS } from '@/lib/constants';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface StatCardsProps {
  statistics: SensorStatistics[];
}

export default function StatCards({ statistics }: StatCardsProps) {
  if (!statistics || statistics.length === 0) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statistics.map((stat) => (
        <Card key={stat.metric} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {METRIC_LABELS[stat.metric] || stat.metric}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.average.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">Average</div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1 text-blue-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="font-semibold">{stat.min_value.toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-500">Min at {stat.time_at_min}</div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1 text-red-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-semibold">{stat.max_value.toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-500">Max at {stat.time_at_max}</div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="text-xs text-gray-600">
                  Std Dev: <span className="font-semibold">{stat.std_deviation.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
