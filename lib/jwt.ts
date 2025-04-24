import jwt from 'jsonwebtoken';

// Get the JWT secret from environment variables or use a consistent fallback
// IMPORTANT: In production, always use environment variables
const DEFAULT_SECRET = 'healthcare-platform-jwt-secret-key-local-dev-only';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_SECRET;

// Add warning for development environments
if (JWT_SECRET === DEFAULT_SECRET) {
  console.warn(
    'WARNING: Using default JWT secret key. Set JWT_SECRET environment variable in production.'
  );
}

const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

export interface JwtPayload {
  id: string;
  email: string;
  role: 'doctor' | 'admin';
  isVerified?: boolean;
}

// Generate a JWT token
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify and decode a JWT token
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
} 