import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connect } from '@/lib/db';
import Doctor from '@/lib/models/Doctor';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { fullName, email, password, medicalLicense, specialization, institution, credentials } = body;

    // Validate required fields
    if (!fullName || !email || !password || !medicalLicense || !specialization || !institution || !credentials) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Connect to database
    await connect();

    // Check if email already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 409 }
      );
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new doctor
    const newDoctor = new Doctor({
      fullName,
      email,
      password: hashedPassword,
      medicalLicense,
      specialization,
      institution,
      credentials,
      isVerified: false, // Default is unverified until admin approves
    });

    // Save the doctor to the database
    await newDoctor.save();

    // Return success response (exclude password)
    const doctorResponse = {
      id: newDoctor._id,
      fullName: newDoctor.fullName,
      email: newDoctor.email,
      medicalLicense: newDoctor.medicalLicense,
      specialization: newDoctor.specialization,
      institution: newDoctor.institution,
      credentials: newDoctor.credentials,
      isVerified: newDoctor.isVerified,
    };

    return NextResponse.json(
      { 
        message: 'Doctor registration successful. Your account is pending verification.', 
        doctor: doctorResponse 
      }, 
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in doctor registration:', error);
    
    return NextResponse.json(
      { error: 'Registration failed', details: error.message },
      { status: 500 }
    );
  }
} 