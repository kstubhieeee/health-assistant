import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Doctor from '@/lib/models/Doctor';
import { addDays } from 'date-fns';

// Extended doctor data with availability information
interface DoctorAvailability {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  reviewCount: number;
  credentials: string;
  yearsExperience: number;
  availability: {
    nextAvailable: Date;
    slots: {
      date: Date;
      times: string[];
    }[];
  };
}

// Mock data generation for availability (since this would typically come from a scheduling system)
function generateAvailabilityData(doctorId: string): {
  nextAvailable: Date;
  slots: { date: Date; times: string[] }[];
} {
  // Randomly determine next available day (1-7 days in future)
  const daysOffset = Math.floor(Math.random() * 7) + 1;
  const nextAvailable = addDays(new Date(), daysOffset);
  
  // Generate 2-3 available days
  const numSlots = Math.floor(Math.random() * 2) + 2;
  const slots = [];
  
  for (let i = 0; i < numSlots; i++) {
    // Add slots starting from next available day
    const slotDate = addDays(nextAvailable, i);
    
    // Generate random time slots (3-5 slots per day)
    const timeSlots = [];
    const timeOptions = [
      "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", 
      "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
    ];
    
    // Randomly select 3-5 time slots
    const numTimeSlots = Math.floor(Math.random() * 3) + 3;
    for (let j = 0; j < numTimeSlots; j++) {
      const randomIndex = Math.floor(Math.random() * timeOptions.length);
      timeSlots.push(timeOptions[randomIndex]);
      // Remove used time to avoid duplicates
      timeOptions.splice(randomIndex, 1);
    }
    
    // Sort time slots chronologically
    timeSlots.sort();
    
    slots.push({
      date: slotDate,
      times: timeSlots
    });
  }
  
  return {
    nextAvailable,
    slots
  };
}

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connect();

    // Find all verified doctors
    const doctors = await Doctor.find(
      { isVerified: true },
      '_id fullName specialization institution credentials isVerified'
    );
    
    // Transform and add availability data
    const availableDoctors: DoctorAvailability[] = doctors.map(doctor => {
      // Generate mock rating data
      const rating = (Math.random() * (5 - 4) + 4).toFixed(1);
      const reviewCount = Math.floor(Math.random() * 150) + 50;
      const yearsExperience = Math.floor(Math.random() * 15) + 5;
      
      return {
        id: doctor._id.toString(),
        name: doctor.fullName,
        specialty: doctor.specialization,
        hospital: doctor.institution,
        credentials: doctor.credentials,
        rating: parseFloat(rating),
        reviewCount,
        yearsExperience,
        availability: generateAvailabilityData(doctor._id.toString())
      };
    });

    return NextResponse.json({ 
      doctors: availableDoctors
    });
  } catch (error) {
    console.error('Error fetching available doctors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available doctors' },
      { status: 500 }
    );
  }
} 