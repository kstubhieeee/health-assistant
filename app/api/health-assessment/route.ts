import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { endpoint, body } = await request.json();

    if (!endpoint || !body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const token = process.env.ASTRA_DB_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: 'API token not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(`https://astra.datastax.com${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
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