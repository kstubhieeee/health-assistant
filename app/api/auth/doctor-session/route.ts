import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Doctor from '@/lib/models/Doctor';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Extract token from header
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'doctor') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Connect to the database
    await connect();

    // Find doctor by ID from token
    const doctor = await Doctor.findById(decoded.id);
    
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Return doctor data (excluding password)
    const doctorData = {
      id: doctor._id,
      fullName: doctor.fullName,
      email: doctor.email,
      specialization: doctor.specialization,
      institution: doctor.institution,
      credentials: doctor.credentials,
      isVerified: doctor.isVerified
    };

    return NextResponse.json({ doctor: doctorData });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    );
  }
} 