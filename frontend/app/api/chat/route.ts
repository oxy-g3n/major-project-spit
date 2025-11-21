import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { sampleData, calculateStatistics } from '@/lib/dataProcessing';
import { ProcessedSensorData } from '@/types/sensor';

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

export async function POST(request: Request) {
  try {
    const { messages, sensorData } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }
    
    // Prepare context from sensor data
    let contextText = '';
    if (sensorData && Array.isArray(sensorData) && sensorData.length > 0) {
      const stats = calculateStatistics(sensorData as ProcessedSensorData[]);
      const sampled = sampleData(sensorData as ProcessedSensorData[], 50);
      
      contextText = `
Current Sensor Statistics:
${stats.map(s => `- ${s.metric}: avg=${s.average}, min=${s.min_value}, max=${s.max_value}, std_dev=${s.std_deviation}`).join('\n')}

Sample Data (${sampled.length} records):
${sampled.slice(0, 10).map(d => `${d.date} ${d.time} - Device: ${d.device_id}, Temp: ${d.bmp_temp_c}°C, Humidity: ${d.humidity_pct}%, Pressure: ${d.pressure_hpa} hPa, Heat Index: ${d.heat_index}`).join('\n')}
`;
    }
    
    const systemPrompt = `You are an expert IoT sensor data analyst assistant. You help users understand and analyze environmental sensor data from a network of 3 devices (DEVICE_001, DEVICE_002, DEVICE_003) measuring:
- Temperature (bmp_temp_c) in Celsius
- Pressure (pressure_hpa) in hectopascals  
- Humidity (humidity_pct) as percentage
- Heat Index (heat_index) - computed feels-like temperature

Your capabilities:
1. Analyze trends and patterns in the sensor data
2. Identify anomalies or concerning readings
3. Provide insights about environmental conditions
4. Compare readings across devices
5. Suggest optimal conditions or alert thresholds
6. Explain what the data means in practical terms

${contextText}

Guidelines:
- Be concise but informative
- Use specific numbers from the data when answering
- Highlight any anomalies or interesting patterns
- If asked about data not available, say so clearly
- Provide actionable insights when relevant`;
    
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.9
    });
    
    return NextResponse.json({
      success: true,
      message: response.choices[0].message.content
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to get chat response', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
