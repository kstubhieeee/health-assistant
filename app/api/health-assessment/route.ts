import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { endpoint, body } = await request.json();

    // Validate the required inputs
    if (!endpoint || !body) {
      return NextResponse.json(
        { error: 'Endpoint and body are required.' },
        { status: 400 }
      );
    }

    // Application token stored in environment variable
    const applicationToken = process.env.LANGFLOW_APP_TOKEN || "AstraCS:dcaKTrgBiPTdZIYSZZkmDRZj:b2aadd96784543bd95347705bfe1e678ac675a28c025a2302c9ad16836720abc";

    // Langflow API URL
    const url = `https://api.langflow.astra.datastax.com${endpoint}`;
    console.log('Making request to:', url);
    console.log('Request body:', JSON.stringify(body, null, 2));

    // Make the API request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${applicationToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body),
    });

    // Get the response text first
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Raw response:', responseText);

    // Check if the response is HTML (indicating an auth error)
    if (responseText.includes('<!DOCTYPE html>')) {
      return NextResponse.json(
        { 
          error: 'Authentication failed',
          details: 'The API returned an HTML login page. This usually means the authentication token has expired or is invalid. Please check your API credentials.',
          status: 401
        },
        { status: 401 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `API Error: ${response.status} ${response.statusText}`,
          details: responseText,
        },
        { status: response.status }
      );
    }

    // Try to parse as JSON, if it fails, return the text as is
    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({ 
        text: responseText,
        type: 'text'
      });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Server Error', 
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
} 