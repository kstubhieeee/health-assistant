import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define User schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Get User model (or create if it doesn't exist)
const User = mongoose.models.User || mongoose.model('User', userSchema);

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

    // Find user by email
    const user = await User.findOne({ email });
    
    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create user data without password
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
    };

    // Return success response with user data
    return NextResponse.json({ 
      message: 'Login successful',
      user: userData 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 