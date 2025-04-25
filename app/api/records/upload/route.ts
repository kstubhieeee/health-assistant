import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
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

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Create directory for user if it doesn't exist
    const userDirPath = path.join(process.cwd(), 'public', 'files', userId.toString());
    await fs.mkdir(userDirPath, { recursive: true });

    // Generate a unique filename with original extension
    const originalName = file.name;
    const fileExt = path.extname(originalName);
    const fileId = uuidv4();
    const fileName = `${fileId}${fileExt}`;
    const filePath = path.join(userDirPath, fileName);
    
    // Create a metadata file to store original name
    const metadataPath = path.join(userDirPath, `${fileId}.meta.json`);
    const metadata = {
      originalName,
      uploadedAt: new Date().toISOString(),
      size: file.size,
      type: fileExt.replace('.', '')
    };

    // Convert file to buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Use writeFile with Uint8Array to avoid type errors
    await fs.writeFile(filePath, new Uint8Array(buffer));
    
    // Save metadata
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    // Create a record in DB (simplified, we're just tracking on filesystem)
    const publicUrl = `/files/${userId}/${fileName}`;
    
    return NextResponse.json({ 
      success: true, 
      fileUrl: publicUrl,
      fileName: originalName,
      displayName: originalName,
      fileId: fileId,
      uploadedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 