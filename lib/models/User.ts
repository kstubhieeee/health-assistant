import mongoose, { Document, Schema } from 'mongoose';

// Define interface for User document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  age?: number;
  sex?: string;
  height?: number;
  weight?: number;
  healthConditions?: string[];
  lifestyleChoices?: string[];
  healthStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define User schema
const UserSchema = new Schema<IUser>(
  {
    name: {
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
    age: {
      type: Number,
      min: 0,
      max: 120,
    },
    sex: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    height: {
      type: Number, // in cm
      min: 0,
    },
    weight: {
      type: Number, // in kg
      min: 0,
    },
    healthConditions: [{
      type: String,
    }],
    lifestyleChoices: [{
      type: String,
    }],
    healthStatus: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export User model
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 