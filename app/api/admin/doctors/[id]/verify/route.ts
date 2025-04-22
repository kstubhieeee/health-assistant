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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if the request is from an authenticated admin
    if (!checkAdminAuth()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const doctorId = params.id;
    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connect();

    // Find doctor by ID
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Update doctor's verification status
    doctor.isVerified = true;
    await doctor.save();

    return NextResponse.json({
      message: 'Doctor verified successfully',
      doctor: {
        id: doctor._id,
        fullName: doctor.fullName,
        email: doctor.email,
        isVerified: doctor.isVerified
      }
    });
  } catch (error) {
    console.error('Error verifying doctor:', error);
    return NextResponse.json(
      { error: 'Failed to verify doctor' },
      { status: 500 }
    );
  }
} 