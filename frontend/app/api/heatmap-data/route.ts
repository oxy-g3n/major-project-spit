import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { ProcessedSensorData } from '@/types/sensor';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Read CSV file from public directory
    const filePath = join(process.cwd(), 'public', 'sensor_data_24h_transformed.csv');
    const fileContent = await readFile(filePath, 'utf-8');
    
    // Parse CSV
    const lines = fileContent.trim().split('\n');
    const headers = lines[0].split(',');
    
    const data: ProcessedSensorData[] = [];
    
    // Skip header row and parse data
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',');
      
      // CSV format: ,date,time,device_id,bmp_temp_c,humidity_pct,pressure_hpa,heat_index
      if (values.length < 8) continue;
      
      const record: ProcessedSensorData = {
        date: values[1],
        time: values[2],
        device_id: values[3],
        bmp_temp_c: parseFloat(values[4]) || 0,
        humidity_pct: parseFloat(values[5]) || 0,
        pressure_hpa: parseFloat(values[6]) || 0,
        heat_index: parseFloat(values[7]) || 0
      };
      
      data.push(record);
    }
    
    return NextResponse.json({
      success: true,
      data,
      totalRecords: data.length,
      source: 'CSV file',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error reading CSV file:', error);
    return NextResponse.json(
      { 
        error: 'Failed to read CSV file', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}
