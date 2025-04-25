import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/db';
import Doctor from '@/lib/models/Doctor';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connect();

    // Parse request body
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find doctor by email
    const doctor = await Doctor.findOne({ email });
    
    // Check if doctor exists and password is correct
    if (!doctor || !(await bcrypt.compare(password, doctor.password))) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      id: doctor._id.toString(),
      email: doctor.email,
      role: 'doctor',
      isVerified: doctor.isVerified
    });

    // Create doctor data without password
    const doctorData = {
      id: doctor._id,
      fullName: doctor.fullName,
      email: doctor.email,
      specialization: doctor.specialization,
      institution: doctor.institution,
      credentials: doctor.credentials,
      isVerified: doctor.isVerified
    };

    // Return success response with doctor data and token
    return NextResponse.json({ 
      message: 'Login successful',
      doctor: doctorData,
      token
    });
  } catch (error) {
    console.error('Doctor login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 