import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Doctor from '@/lib/models/Doctor';
import { cookies } from 'next/headers';

// Middleware to check admin authentication
const checkAdminAuth = () => {
  const adminSession = cookies().get('adminSession')?.value;
  if (!adminSession) {
    return false;
  }
  return true;
};

export async function GET(request: NextRequest) {
  try {
    // Check if the request is from an authenticated admin
    if (!checkAdminAuth()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to the database
    await connect();

    // Get all doctors
    const doctors = await Doctor.find({}).sort({ createdAt: -1 });

    // Transform the doctor data for response
    const doctorsData = doctors.map(doctor => ({
      id: doctor._id,
      fullName: doctor.fullName,
      email: doctor.email,
      medicalLicense: doctor.medicalLicense,
      specialization: doctor.specialization,
      institution: doctor.institution,
      credentials: doctor.credentials,
      isVerified: doctor.isVerified,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt
    }));

    return NextResponse.json({ doctors: doctorsData });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
} 