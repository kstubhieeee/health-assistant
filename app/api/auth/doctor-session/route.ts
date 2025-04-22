import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Doctor from '@/lib/models/Doctor';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get doctor ID from cookies or request
    const doctorId = cookies().get('doctorId')?.value;
    
    if (!doctorId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Connect to the database
    await connect();

    // Find doctor by ID
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      // Clear the cookie if doctor not found
      cookies().delete('doctorId');
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