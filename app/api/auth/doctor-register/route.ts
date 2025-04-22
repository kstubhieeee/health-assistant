import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Doctor from '@/lib/models/Doctor';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connect();

    // Parse the request body
    const { 
      fullName, 
      email, 
      password, 
      medicalLicense, 
      specialization, 
      institution, 
      credentials 
    } = await request.json();

    // Validate inputs
    if (!fullName || !email || !password || !medicalLicense) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the doctor
    const doctor = await Doctor.create({
      fullName,
      email,
      password: hashedPassword,
      medicalLicense,
      specialization,
      institution,
      credentials,
      isVerified: false, // Doctors need to be verified before accessing full features
    });

    // Return the doctor (excluding password)
    const doctorResponse = {
      id: doctor._id,
      fullName: doctor.fullName,
      email: doctor.email,
      medicalLicense: doctor.medicalLicense,
      specialization: doctor.specialization,
      institution: doctor.institution,
      credentials: doctor.credentials,
      isVerified: doctor.isVerified,
      createdAt: doctor.createdAt,
    };

    return NextResponse.json(
      { 
        message: 'Registration successful! Your account is pending verification.', 
        doctor: doctorResponse 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Doctor registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register doctor account', details: error.message },
      { status: 500 }
    );
  }
} 