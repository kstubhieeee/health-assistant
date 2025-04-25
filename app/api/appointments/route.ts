import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/db';
import Appointment from '@/lib/models/Appointment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from '@/lib/models/User';
import OAuthUser from '@/lib/models/OAuthUser';
import Doctor from '@/lib/models/Doctor';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import mongoose from 'mongoose';

// GET all appointments for current user (either patient or doctor)
export async function GET(request: NextRequest) {
  try {
    await connect();
    
    // Check URL params
    const url = new URL(request.url);
    const role = url.searchParams.get('role');
    const status = url.searchParams.get('status');
    
    // Build query
    const query: any = {};
    
    // Check for doctor authentication if role is doctor
    if (role === 'doctor') {
      // Try to get doctor token from cookies
      const doctorToken = cookies().get('doctor_token')?.value;
      
      if (!doctorToken) {
        return NextResponse.json(
          { error: 'Not authenticated as doctor' },
          { status: 401 }
        );
      }
      
      try {
        // Verify the doctor token
        const decoded = verifyToken(doctorToken);
        
        if (!decoded || decoded.role !== 'doctor') {
          return NextResponse.json(
            { error: 'Invalid doctor token' },
            { status: 401 }
          );
        }
        
        // Set doctor ID in query
        query.doctor = decoded.id;
      } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json(
          { error: 'Invalid doctor token' },
          { status: 401 }
        );
      }
    } else {
      // For patient role, use NextAuth session
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Not authenticated as patient' },
          { status: 401 }
        );
      }
      
      // Default to patient role
      query.patient = session.user.id;
    }
    
    // Filter by status if provided
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }
    
    // Get appointments with regular user patients first
    const appointments = await Appointment.find(query)
      .populate('doctor', 'fullName specialization institution')
      .sort({ date: 1 }) // Sort by date, earliest first
      .exec();

    // Now use the embedded patientDetails if available, or try to populate from collections if needed
    const populatedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        // Create a copy of the appointment object to modify
        const appointmentObj = appointment.toObject();
        
        // Check if we already have embedded patient details
        if (appointment.patientDetails && appointment.patientDetails.name) {
          console.log(`Using embedded patient details for appointment ${appointment._id}: ${appointment.patientDetails.name}`);
          
          // Use the embedded details but maintain the expected structure
          appointmentObj.patient = {
            _id: appointment.patient,
            name: appointment.patientDetails.name,
            email: appointment.patientDetails.email
          };
          
          return appointmentObj;
        }
        
        // If no embedded details, proceed with the existing logic to try finding patient data
        // Extract the patient ID
        const patientId = appointment.patient ? 
          (typeof appointment.patient === 'string' ? appointment.patient : appointment.patient._id) : 
          null;
          
        console.log(`No embedded details for appointment ${appointment._id}, looking up patient ID: ${patientId}`);
        
        if (!patientId) {
          console.log(`No patient ID for appointment ${appointment._id}`);
          
          // Add placeholder for missing patient
          appointmentObj.patient = {
            _id: new mongoose.Types.ObjectId(),
            name: `Unknown Patient`,
            email: `unknown@example.com`
          };
          
          return appointmentObj;
        }
        
        try {
          // Try both models to find the patient
          const regularUser = await User.findById(patientId);
          const oauthUser = await OAuthUser.findById(patientId);
          
          if (regularUser) {
            console.log(`Found patient in User model: ${regularUser.name}`);
            appointmentObj.patient = {
              _id: regularUser._id,
              name: regularUser.name,
              email: regularUser.email
            };
            return appointmentObj;
          }
          
          if (oauthUser) {
            console.log(`Found patient in OAuthUser model: ${oauthUser.name}`);
            appointmentObj.patient = {
              _id: oauthUser._id,
              name: oauthUser.name,
              email: oauthUser.email
            };
            return appointmentObj;
          }
          
          // If patient not found in models, generate a placeholder with the ID
          console.log(`Patient ${patientId} not found in any model, using ID-based placeholder`);
          appointmentObj.patient = {
            _id: patientId,
            name: `Patient (ID: ${patientId.toString().substring(0, 8)}...)`,
            email: `patient-${patientId.toString().substring(0, 6)}@example.com`
          };
        } catch (error) {
          console.error(`Error finding patient for appointment ${appointment._id}:`, error);
          
          // Add placeholder for error case
          appointmentObj.patient = {
            _id: new mongoose.Types.ObjectId(),
            name: `Error Patient`,
            email: `error@example.com`
          };
        }
        
        return appointmentObj;
      })
    );
    
    // Log details for debugging
    console.log(`Found ${populatedAppointments.length} appointments for query:`, query);
    populatedAppointments.forEach((appointment, index) => {
      console.log(`Appointment ${index}:`, {
        id: appointment._id,
        status: appointment.status,
        patientId: appointment.patient?._id || 'No patient ID',
        patientData: appointment.patient ? {
          name: appointment.patient.name,
          email: appointment.patient.email
        } : 'Patient data missing'
      });
      
      // If patient data is missing, add placeholder patient data
      if (!appointment.patient || !appointment.patient.name) {
        console.log(`Adding placeholder data for appointment ${appointment._id}`);
        
        // Use the patient ID if available or generate a placeholder
        const patientId = appointment.patient?._id || appointment.patient || new mongoose.Types.ObjectId();
        
        // Add placeholder patient data
        appointment.patient = {
          _id: patientId,
          name: `Patient ${index + 1}`,
          email: `patient${index + 1}@example.com`
        };
      }
    });
    
    return NextResponse.json({ appointments: populatedAppointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// POST new appointment request
export async function POST(request: NextRequest) {
  try {
    await connect();
    
    // Get session to check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const { doctorId, date, time, reason } = await request.json();
    
    // Validate inputs
    if (!doctorId || !date || !time || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if the doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }
    
    // Find the patient user data to store directly in the appointment
    let patientData = null;
    
    // Try to get patient data from User model
    const regularUser = await User.findById(session.user.id);
    if (regularUser) {
      patientData = {
        id: regularUser._id,
        name: regularUser.name,
        email: regularUser.email
      };
    } else {
      // If not found, try OAuthUser model
      const oauthUser = await OAuthUser.findById(session.user.id);
      if (oauthUser) {
        patientData = {
          id: oauthUser._id,
          name: oauthUser.name,
          email: oauthUser.email
        };
      }
    }
    
    if (!patientData) {
      console.error(`Cannot find patient data for user ${session.user.id}`);
      return NextResponse.json(
        { error: 'Patient data not found' },
        { status: 404 }
      );
    }
    
    // Create the appointment with embedded patient details
    const appointment = await Appointment.create({
      patient: session.user.id, // Keep the reference ID
      patientDetails: {         // Add embedded patient details
        name: patientData.name,
        email: patientData.email
      },
      doctor: doctorId,
      date: new Date(date),
      time,
      reason,
      status: 'pending'
    });
    
    return NextResponse.json({ 
      message: 'Appointment request created successfully',
      appointment
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment request' },
      { status: 500 }
    );
  }
} 