import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/db';
import Appointment from '@/lib/models/Appointment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';

// GET specific appointment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const appointmentId = params.id;
    
    // Find the appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctor', 'fullName specialization institution')
      .populate('patient', 'name email')
      .exec();
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is either the patient or the doctor
    const isPatient = appointment.patient._id.toString() === session.user.id;
    const isDoctor = appointment.doctor._id.toString() === session.user.id;
    
    if (!isPatient && !isDoctor) {
      return NextResponse.json(
        { error: 'Not authorized to view this appointment' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ appointment });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    );
  }
}

// PATCH to update appointment status (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const appointmentId = params.id;
    
    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is the doctor
    if (appointment.doctor.toString() !== userId) {
      return NextResponse.json(
        { error: 'Only the doctor can update appointment status' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const { status, rejectionReason, meetingLink } = await request.json();
    
    // Validate status
    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "approved" or "rejected"' },
        { status: 400 }
      );
    }
    
    // If rejecting, require a reason
    if (status === 'rejected' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }
    
    // If approving, require a meeting link
    if (status === 'approved' && !meetingLink) {
      return NextResponse.json(
        { error: 'Meeting link is required for approval' },
        { status: 400 }
      );
    }
    
    try {
      let updatedAppointment;
      let appointmentObj;
      
      if (status === 'rejected') {
        // Update for rejection
        updatedAppointment = await Appointment.findByIdAndUpdate(
          appointmentId,
          {
            status: 'rejected',
            rejectionReason: rejectionReason,
            meetingLink: null
          },
          { new: true, runValidators: true }
        )
        .populate('doctor', 'fullName specialization institution')
        .populate('patient', 'name email');
        
        if (!updatedAppointment) {
          return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
        }
        
        appointmentObj = updatedAppointment.toObject();
      } 
      else if (status === 'approved') {
        // Format meeting link
        let formattedLink = meetingLink.trim();
        if (!formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
          formattedLink = 'https://' + formattedLink;
        }
        
        // First set meeting link directly to make sure it's stored
        await Appointment.updateOne(
          { _id: appointmentId },
          { $set: { meetingLink: formattedLink } }
        );
        
        // Then update the full appointment
        updatedAppointment = await Appointment.findByIdAndUpdate(
          appointmentId,
          {
            status: 'approved',
            meetingLink: formattedLink,
            rejectionReason: null
          },
          { new: true, runValidators: true }
        )
        .populate('doctor', 'fullName specialization institution')
        .populate('patient', 'name email');
        
        if (!updatedAppointment) {
          return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
        }
        
        appointmentObj = updatedAppointment.toObject();
        
        // Check if the meeting link was properly saved
        if (!updatedAppointment.meetingLink) {
          console.warn('Meeting link not saved properly, setting manually in response');
          appointmentObj.meetingLink = formattedLink;
          
          // Try a final fallback update in the database
          await Appointment.updateOne(
            { _id: appointmentId },
            { $set: { meetingLink: formattedLink } }
          );
        }
      }
      else {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
      
      // Handle null patient field
      if (!appointmentObj.patient) {
        appointmentObj.patient = {
          _id: new mongoose.Types.ObjectId().toString(),
          name: "Unknown Patient",
          email: "unknown@example.com"
        };
      }
      
      console.log('Final appointment object:', JSON.stringify(appointmentObj, null, 2));
      
      return NextResponse.json({ 
        message: `Appointment ${status}`,
        appointment: appointmentObj
      });
    } catch (error) {
      console.error('Database update error:', error);
      return NextResponse.json(
        { error: 'Database update failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// DELETE appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const appointmentId = params.id;
    
    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is either the patient or the doctor
    const isPatient = appointment.patient.toString() === userId;
    const userIsDoctor = appointment.doctor.toString() === userId;
    
    if (!isPatient && !userIsDoctor) {
      return NextResponse.json(
        { error: 'Not authorized to delete this appointment' },
        { status: 403 }
      );
    }
    
    // Only allow deletion if appointment is pending or if the user is a doctor
    if (appointment.status !== 'pending' && !userIsDoctor) {
      return NextResponse.json(
        { error: 'Cannot delete an appointment that has already been processed' },
        { status: 400 }
      );
    }
    
    // Delete the appointment
    await appointment.deleteOne();
    
    return NextResponse.json({ 
      message: 'Appointment deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
} 