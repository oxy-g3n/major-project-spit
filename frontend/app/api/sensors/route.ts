import { NextResponse } from 'next/server';
import { processSensorData, filterCompleteTimestamps } from '@/lib/dataProcessing';
import { FIREBASE_URL } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterComplete = searchParams.get('filterComplete') === 'true';
    
    const response = await fetch(`${FIREBASE_URL}/NEW_BOARDS.json`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch data from Firebase' }, 
        { status: response.status }
      );
    }
    
    const rawData = await response.json();
    
    if (!rawData) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }
    
    // Count raw readings before processing
    let rawCount = 0;
    for (const deviceData of Object.values(rawData)) {
      if (typeof deviceData === 'object' && deviceData !== null) {
        rawCount += Object.keys(deviceData).length;
      }
    }
    
    const processed = processSensorData(rawData);
    const filtered = filterComplete ? filterCompleteTimestamps(processed) : processed;
    
    return NextResponse.json({
      success: true,
      data: filtered,
      rawReadings: rawCount,
      totalRecords: processed.length,
      filteredRecords: filterComplete ? filtered.length : processed.length,
      isFiltered: filterComplete,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
