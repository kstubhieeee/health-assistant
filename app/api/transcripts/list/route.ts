import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get transcripts from specified folder
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Define the path to the transcripts folder
    const transcriptsFolder = path.join('C:', 'Users', 'KAUSTUBH VIJAY BANE', 'Downloads', 'ARISE');
    
    // Check if directory exists
    try {
      await fs.access(transcriptsFolder);
    } catch (error) {
      // Directory doesn't exist, return empty array
      return NextResponse.json({ files: [] });
    }
    
    // Get all files in the directory
    const files = await fs.readdir(transcriptsFolder);
    
    // Filter for .txt files
    const textFiles = files.filter(file => file.toLowerCase().endsWith('.txt'));
    
    // Get file information for each file
    const fileDetails = await Promise.all(textFiles.map(async (fileName) => {
      const filePath = path.join(transcriptsFolder, fileName);
      const stats = await fs.stat(filePath);
      
      return {
        name: fileName,
        path: filePath,
        createdAt: stats.birthtime,
        size: stats.size,
      };
    }));
    
    // Sort files by creation date (newest first)
    fileDetails.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return NextResponse.json({ files: fileDetails });
  } catch (error: any) {
    console.error('Error listing transcript files:', error);
    return NextResponse.json(
      { error: 'Failed to list transcript files' },
      { status: 500 }
    );
  }
} 