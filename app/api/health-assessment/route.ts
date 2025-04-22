import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { input_value, input_type, output_type, tweaks } = await request.json();

    if (!input_value) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Hard-coded token for testing - Replace this with your actual token
    // In production, use environment variables: const token = process.env.ASTRA_DB_TOKEN;
    const token = process.env.LANGFLOW_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: 'API token not configured' },
        { status: 500 }
      );
    }

    const url = 'https://api.langflow.astra.datastax.com/lf/a5f41bdf-f499-42e4-9506-50a4e0a779fc/api/v1/run/1102782b-5597-4176-98b0-18a0f977e74b?stream=false';
    console.log('Making request to:', url);
    console.log('Request body:', JSON.stringify({ input_value, input_type, output_type, tweaks }, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        input_value,
        input_type: input_type || 'chat',
        output_type: output_type || 'chat',
        tweaks
      })
    });

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'API request failed',
          details: responseText
        },
        { status: response.status }
      );
    }

    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch (e) {
      return NextResponse.json({
        type: 'text',
        text: responseText
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process health assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 