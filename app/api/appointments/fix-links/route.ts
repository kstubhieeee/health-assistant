import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/db';
import Appointment from '@/lib/models/Appointment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';

// Endpoint to fix missing meeting links and patient references on approved appointments
export async function GET(request: NextRequest) {
  try {
    await connect();
    
    // Try both authentication methods
    const session = await getServerSession(authOptions);
    const cookieStore = cookies();
    const doctorToken = cookieStore.get('doctor_token')?.value;
    
    let userId = null;
    let isDoctor = false;
    
    // Check NextAuth session first
    if (session?.user?.id) {
      userId = session.user.id;
    } 
    // Then check doctor token
    else if (doctorToken) {
      try {
        const decodedToken = verifyToken(doctorToken);
        if (decodedToken && decodedToken.id) {
          userId = decodedToken.id;
          isDoctor = decodedToken.role === 'doctor';
        }
      } catch (error) {
        console.error('Invalid doctor token:', error);
      }
    }
    
    if (!userId || !isDoctor) {
      return NextResponse.json(
        { error: 'Only doctors can fix meeting links' },
        { status: 401 }
      );
    }
    
    // Get a URL parameter for the default link to use
    const url = new URL(request.url);
    let defaultLink = url.searchParams.get('defaultLink') || 'https://example.com/meeting';
    
    // Ensure the default link has https:// prefix
    if (!defaultLink.startsWith('http://') && !defaultLink.startsWith('https://')) {
      defaultLink = 'https://' + defaultLink;
    }
    
    // Find all approved appointments without valid meeting links
    const approvedAppointments = await Appointment.find({
      status: 'approved',
      doctor: userId,
      $or: [
        { meetingLink: { $exists: false } },
        { meetingLink: null },
        { meetingLink: '' }
      ]
    });
    
    console.log(`Found ${approvedAppointments.length} approved appointments without meeting links`);
    
    // Fix meeting links
    if (approvedAppointments.length > 0) {
      // Update meeting links for all appointments without them
      const meetingLinkResult = await Appointment.updateMany(
        {
          _id: { $in: approvedAppointments.map(app => app._id) }
        },
        {
          $set: { meetingLink: defaultLink }
        }
      );
      
      console.log('Meeting link updates:', meetingLinkResult);
    }
    
    // Look for appointments with null patients
    const nullPatientAppointments = await Appointment.find({
      doctor: userId,
      $or: [
        { patient: null },
        { patient: { $exists: false } }
      ]
    });
    
    console.log(`Found ${nullPatientAppointments.length} appointments with null patient references`);
    
    // We can't directly fix patient references as they're foreign keys,
    // but we can report the IDs to help with debugging
    const nullPatientIds = nullPatientAppointments.map(app => app._id);
    
    // Verify the meeting link fixes worked
    const stillMissingLinks = await Appointment.countDocuments({
      status: 'approved',
      doctor: userId,
      $or: [
        { meetingLink: { $exists: false } },
        { meetingLink: null },
        { meetingLink: '' }
      ]
    });
    
    return NextResponse.json({
      message: approvedAppointments.length > 0 
        ? `Fixed ${approvedAppointments.length} appointments` 
        : 'No appointments needed meeting link fixes',
      stillMissingLinks,
      nullPatientAppointments: nullPatientIds,
      status: 'success'
    });
  } catch (error) {
    console.error('Error fixing meeting links:', error);
    return NextResponse.json(
      { error: 'Failed to fix meeting links' },
      { status: 500 }
    );
  }
} 