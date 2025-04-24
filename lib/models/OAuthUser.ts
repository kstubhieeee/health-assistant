import mongoose, { Document, Schema } from 'mongoose';

// Define interface for OAuth User document
export interface IOAuthUser extends Document {
  name: string;
  email: string;
  image?: string;
  provider: string;
  providerId: string;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define OAuthUser schema
const OAuthUserSchema = new Schema<IOAuthUser>(
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
    image: {
      type: String,
    },
    provider: {
      type: String,
      required: [true, 'Provider is required'],
      enum: ['github', 'google'],
    },
    providerId: {
      type: String,
      required: [true, 'Provider ID is required'],
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for provider and providerId
OAuthUserSchema.index({ provider: 1, providerId: 1 }, { unique: true });

// Create and export OAuthUser model
const OAuthUser = mongoose.models.OAuthUser || mongoose.model<IOAuthUser>('OAuthUser', OAuthUserSchema);

export default OAuthUser; 