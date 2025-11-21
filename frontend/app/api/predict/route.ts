import { NextResponse } from 'next/server';
import { predictTemperature } from '@/lib/dataProcessing';
import { ProcessedSensorData } from '@/types/sensor';

export async function POST(request: Request) {
  try {
    const { data, targetTime } = await request.json();
    
    if (!data || !Array.isArray(data) || !targetTime) {
      return NextResponse.json(
        { error: 'Invalid request. Provide data and targetTime' },
        { status: 400 }
      );
    }
    
    const prediction = predictTemperature(data as ProcessedSensorData[], targetTime);
    
    if (prediction === null) {
      return NextResponse.json(
        { error: 'Unable to predict temperature' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      prediction,
      targetTime
    });
  } catch (error) {
    console.error('Error predicting temperature:', error);
    return NextResponse.json(
      { error: 'Failed to predict temperature' },
      { status: 500 }
    );
  }
}
