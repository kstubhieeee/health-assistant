import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get transcript content from request body
    const body = await request.json();
    const { content } = body;
    
    if (!content) {
      return NextResponse.json({ error: 'Transcript content is required' }, { status: 400 });
    }

    // If Gemini API key is not set, return a mock summary for development
    if (!process.env.GEMINI_API_KEY) {
      console.warn('Gemini API key not found, returning mock summary');
      return NextResponse.json({
        summary: `This is a mock summary since the Gemini API key is not configured.
        
In a real implementation, this would be a concise summary of the conversation between the doctor and patient, highlighting:
- Key symptoms discussed
- Diagnosis or potential conditions
- Treatment plans or recommendations
- Follow-up actions
- Important medical advice

To enable real AI summaries, please add your Gemini API key to the environment variables.`
      });
    }

    // Generate summary using Gemini API directly
    const promptText = `You are a medical summarization assistant. Summarize the following transcript of a doctor-patient conversation.
    Focus on key medical information:
    1. Patient symptoms and concerns
    2. Doctor's diagnosis or assessment
    3. Treatment recommendations
    4. Medications prescribed (if any)
    5. Follow-up instructions
    
    Keep the summary concise, clear, and professionally formatted.
    
    TRANSCRIPT:
    ${content}`;
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: promptText }]
        }]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate summary';
    
    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary', details: error.message },
      { status: 500 }
    );
  }
} 