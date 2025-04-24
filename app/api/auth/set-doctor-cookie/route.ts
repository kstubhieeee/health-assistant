import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Set doctor_token as an HTTP-only cookie
    cookies().set({
      name: 'doctor_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days (match JWT expiration)
    });

    return NextResponse.json({
      message: 'Cookie set successfully'
    });
  } catch (error) {
    console.error('Set cookie error:', error);
    return NextResponse.json(
      { error: 'Failed to set cookie' },
      { status: 500 }
    );
  }
} 