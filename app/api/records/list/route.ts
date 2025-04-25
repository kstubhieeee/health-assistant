import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { promises as fs } from 'fs';
import path from 'path';

// File metadata interface
interface FileMetadata {
  originalName: string;
  uploadedAt: string;
  size: number;
  type: string;
}

// File type detection helper
const getFileType = (fileName: string): string => {
  const ext = path.extname(fileName).toLowerCase().replace('.', '');
  
  // Group file types into categories
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
  const spreadsheetTypes = ['xls', 'xlsx', 'csv'];
  const presentationTypes = ['ppt', 'pptx'];
  
  if (imageTypes.includes(ext)) return 'image';
  if (documentTypes.includes(ext)) return 'document';
  if (spreadsheetTypes.includes(ext)) return 'spreadsheet';
  if (presentationTypes.includes(ext)) return 'presentation';
  
  return ext || 'unknown';
};

// File name display helper
const getDisplayName = (fileName: string): string => {
  // Get file extension
  const ext = path.extname(fileName);
  const nameWithoutExt = path.basename(fileName, ext);
  
  // Try to extract a more readable name - for now let's just
  // format the UUID to be shorter
  const shortId = nameWithoutExt.substring(0, 6);
  
  return `File ${shortId}${ext}`;
};

// Helper to load metadata
const loadMetadata = async (dirPath: string, fileId: string): Promise<FileMetadata | null> => {
  try {
    const metadataPath = path.join(dirPath, `${fileId}.meta.json`);
    const metadataContent = await fs.readFile(metadataPath, 'utf8');
    return JSON.parse(metadataContent) as FileMetadata;
  } catch (error) {
    return null;
  }
};

export async function GET(request: NextRequest) {
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

    // Get path to user's directory
    const userDirPath = path.join(process.cwd(), 'public', 'files', userId.toString());
    
    // Check if directory exists
    try {
      await fs.access(userDirPath);
    } catch (error) {
      // Directory doesn't exist, return empty array
      return NextResponse.json({ files: [] });
    }
    
    // Get all files in the directory
    const allFiles = await fs.readdir(userDirPath);
    
    // Filter out metadata files and only process actual files
    const fileNames = allFiles.filter(file => !file.includes('.meta.json'));
    
    // Get file information for each file
    const files = await Promise.all(fileNames.map(async (fileName) => {
      const filePath = path.join(userDirPath, fileName);
      const stats = await fs.stat(filePath);
      
      // Get file metadata (we would typically store this in a database)
      // For now we'll extract what we can from the filename and stats
      const fileId = fileName.split('.')[0];
      const fileExt = path.extname(fileName);
      const fileType = getFileType(fileName);
      
      // Try to load metadata if available
      const metadata = await loadMetadata(userDirPath, fileId);
      
      return {
        id: fileId,
        name: fileName,
        displayName: metadata?.originalName || getDisplayName(fileName),
        url: `/files/${userId}/${fileName}`,
        size: stats.size,
        createdAt: metadata?.uploadedAt || stats.birthtime.toISOString(),
        updatedAt: stats.mtime.toISOString(),
        type: fileExt.replace('.', ''),
        category: fileType,
        originalName: metadata?.originalName
      };
    }));
    
    // Sort files by creation date (newest first)
    files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json({ files });
  } catch (error: any) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
} 