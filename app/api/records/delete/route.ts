import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { promises as fs } from 'fs';
import path from 'path';

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = session.user.id || session.user.email;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    // Get file ID from query params
    const url = new URL(request.url);
    const fileId = url.searchParams.get('fileId');
    const fileName = url.searchParams.get('fileName');
    
    if (!fileId && !fileName) {
      return NextResponse.json({ error: 'File ID or filename is required' }, { status: 400 });
    }

    // Get path to user's directory
    const userDirPath = path.join(process.cwd(), 'public', 'files', userId.toString());
    
    // Find file to delete
    try {
      let filePath;
      
      if (fileName) {
        // Use exact filename if provided
        filePath = path.join(userDirPath, fileName);
      } else if (fileId) {
        // Find file by ID if fileId is not null
        const files = await fs.readdir(userDirPath);
        const matchingFile = files.find(file => file.startsWith(fileId));
        
        if (!matchingFile) {
          return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        
        filePath = path.join(userDirPath, matchingFile);
      } else {
        return NextResponse.json({ error: 'File ID or filename is required' }, { status: 400 });
      }

      // Check if file exists
      await fs.access(filePath);
      
      // Delete the file
      await fs.unlink(filePath);
      
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
} 