import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get content of a transcript file
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get file name from query params
    const url = new URL(request.url);
    const fileName = url.searchParams.get('fileName');
    
    if (!fileName) {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 });
    }

    // Define the path to the transcripts folder
    const transcriptsFolder = path.join('C:', 'Users', 'KAUSTUBH VIJAY BANE', 'Downloads', 'ARISE');
    const filePath = path.join(transcriptsFolder, fileName);
    
    // Check if file exists and read its content
    try {
      await fs.access(filePath);
      const content = await fs.readFile(filePath, 'utf8');
      
      return NextResponse.json({
        content,
        summary: '' // Empty summary initially, will be populated by the AI
      });
    } catch (error) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Error reading transcript file:', error);
    return NextResponse.json(
      { error: 'Failed to read transcript file' },
      { status: 500 }
    );
  }
} 