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

    // Get the rejection reason from the request body
    const { rejectionReason } = await request.json();

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
    doctor.isVerified = false;
    
    // For storing rejection reason, you might want to extend the Doctor model
    // For now, we'll just update the isVerified status
    await doctor.save();

    return NextResponse.json({
      message: 'Doctor account rejected',
      doctor: {
        id: doctor._id,
        fullName: doctor.fullName,
        email: doctor.email,
        isVerified: doctor.isVerified
      }
    });
  } catch (error) {
    console.error('Error rejecting doctor:', error);
    return NextResponse.json(
      { error: 'Failed to reject doctor' },
      { status: 500 }
    );
  }
} 