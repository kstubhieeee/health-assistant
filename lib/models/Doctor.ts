import mongoose, { Document, Schema } from 'mongoose';

// Define interface for Doctor document
export interface IDoctor extends Document {
  fullName: string;
  email: string;
  password: string;
  medicalLicense: string;
  specialization: string;
  institution: string;
  credentials: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define Doctor schema
const DoctorSchema = new Schema<IDoctor>(
  {
    fullName: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
    },
    medicalLicense: {
      type: String,
      required: [true, 'Please provide a medical license number'],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, 'Please provide your specialization'],
    },
    institution: {
      type: String,
      required: [true, 'Please provide your institution/practice'],
    },
    credentials: {
      type: String,
      required: [true, 'Please provide your professional credentials'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export Doctor model
export default mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema); 