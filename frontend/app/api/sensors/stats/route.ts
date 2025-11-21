import { NextResponse } from 'next/server';
import { calculateStatistics } from '@/lib/dataProcessing';
import { ProcessedSensorData } from '@/types/sensor';

export async function POST(request: Request) {
  try {
    const { data } = await request.json();
    
    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }
    
    const stats = calculateStatistics(data as ProcessedSensorData[]);
    
    return NextResponse.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    console.error('Error calculating statistics:', error);
    return NextResponse.json(
      { error: 'Failed to calculate statistics' },
      { status: 500 }
    );
  }
}
