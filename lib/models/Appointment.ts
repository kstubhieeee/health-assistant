import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IDoctor } from './Doctor';

// Interface for embedded patient details
interface PatientDetails {
  name: string;
  email: string;
}

// Define interface for Appointment document
export interface IAppointment extends Document {
  patient: IUser['_id'];
  patientDetails?: PatientDetails;  // Add embedded patient details
  doctor: IDoctor['_id'];
  date: Date;
  time: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  meetingLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define Appointment schema
const AppointmentSchema = new Schema<IAppointment>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient is required'],
    },
    patientDetails: {
      name: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for appointment is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      // Only required if status is 'rejected'
    },
    meetingLink: {
      type: String,
      required: false
    },
  },
  {
    timestamps: true,
  }
);

// Create and export Appointment model
export default mongoose.models.Appointment || 
  mongoose.model<IAppointment>('Appointment', AppointmentSchema); 