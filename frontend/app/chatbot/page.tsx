'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import ChatInterface from '@/components/chatbot/ChatInterface';
import DataSummary from '@/components/chatbot/DataSummary';
import { ProcessedSensorData, SensorStatistics } from '@/types/sensor';
import { AlertCircle } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ChatbotPage() {
  const { data, error, isLoading } = useSWR('/api/sensors', fetcher);
  const [statistics, setStatistics] = useState<SensorStatistics[]>([]);
  
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
  
  const sensorData: ProcessedSensorData[] = data.data || [];
  
  // Check if API key is likely wrong (XAI instead of Groq)
  const hasWrongApiKey = process.env.NEXT_PUBLIC_GROQ_KEY_WARNING === 'true';
  
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Warning banner for wrong API key
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-900">
              API Key Configuration Required
            </p>
            <p className="text-xs text-yellow-800 mt-1">
              The chatbot requires a <strong>Groq API key</strong> (starts with "gsk_"). 
              Your current key in .env.local starts with "xai-" which is for XAI, not Groq.
              Get a free Groq key at <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">console.groq.com</a>
            </p>
          </div>
        </div>
      </div> */}
      
      <div className="flex-1 flex">
        <div className="w-80 bg-white border-r overflow-y-auto">
          <DataSummary 
            statistics={statistics} 
            recordCount={sensorData.length}
          />
        </div>
        
        <div className="flex-1">
          <ChatInterface sensorData={sensorData} />
        </div>
      </div>
    </div>
  );
}
