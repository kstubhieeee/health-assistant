import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Doctor from '@/lib/models/Doctor';

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connect();

    // Find all verified doctors
    const doctors = await Doctor.find(
      { isVerified: true },
      '_id fullName specialization institution credentials isVerified'
    );
    
    // Format the response data
    const formattedDoctors = doctors.map(doctor => ({
      id: doctor._id.toString(),
      fullName: doctor.fullName,
      specialization: doctor.specialization,
      institution: doctor.institution,
      credentials: doctor.credentials,
      isVerified: doctor.isVerified
    }));

    return NextResponse.json({ 
      doctors: formattedDoctors
    });
  } catch (error) {
    console.error('Error fetching verified doctors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
} 