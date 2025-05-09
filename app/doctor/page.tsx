"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Clock, 
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DoctorHeader from "@/components/doctor-header";

interface DoctorData {
  id: string;
  fullName: string;
  email: string;
  specialization: string;
  institution: string;
  credentials: string;
  isVerified: boolean;
}

export default function DoctorVerificationPage() {
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // We rely on the cookie and middleware for authentication
    // Just load the doctor data from localStorage for UI display
    const storedDoctor = localStorage.getItem("doctor");
    if (storedDoctor) {
      try {
        const parsedDoctor = JSON.parse(storedDoctor);
        console.log("Using stored doctor data:", parsedDoctor.email);
        setDoctor(parsedDoctor);
        
        // If doctor is verified, redirect to dashboard
        if (parsedDoctor.isVerified) {
          console.log("Doctor is verified, redirecting to dashboard");
          window.location.href = "/doctor/dashboard";
          return;
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error parsing stored doctor data:", error);
      }
    }

    // Always fetch doctor data from session API to get the latest data
    const fetchDoctorData = async () => {
      try {
        console.log("Fetching doctor data from API");
        const response = await fetch("/api/auth/doctor-session", {
          // No need to send token - the cookie will be sent automatically
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to get doctor information");
        }

        const data = await response.json();
        console.log("Doctor data fetched successfully");
        setDoctor(data.doctor);
        
        // Update stored doctor data in localStorage
        localStorage.setItem("doctor", JSON.stringify(data.doctor));
        
        // If doctor is verified, redirect to dashboard
        if (data.doctor.isVerified) {
          console.log("Doctor is verified, redirecting to dashboard");
          window.location.href = "/doctor/dashboard";
          return;
        }
      } catch (error: any) {
        console.error("Failed to fetch doctor data:", error);
        setError("Unable to load your information. Please sign in again.");
        
        // Clear localStorage data
        localStorage.removeItem("doctor");
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          window.location.href = "/auth/doctor-login";
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking account status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md">
          <div className="flex items-center gap-3 mb-4 text-destructive">
            <AlertCircle />
            <h2 className="text-xl font-semibold">Session Error</h2>
          </div>
          <p className="mb-6">{error}</p>
          <Button asChild>
            <Link href="/auth/doctor-login">Return to Sign In</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Show pending verification UI
  return (
    <>
      <DoctorHeader doctorName={doctor?.fullName} />
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary pt-6">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center text-sm mb-8 hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <Card className="max-w-2xl mx-auto p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Verification Pending</h1>
              <p className="text-muted-foreground">
                Your professional account is currently under review.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <h2 className="font-medium mb-2">What happens next?</h2>
                <p className="text-sm text-muted-foreground">
                  Our team will verify your professional credentials and medical license. 
                  This process typically takes 1-3 business days. You'll receive an email 
                  notification once your account has been approved.
                </p>
              </div>

              <div>
                <h2 className="font-medium mb-2">Your Information</h2>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <span className="text-sm font-medium">{doctor?.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="text-sm font-medium">{doctor?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Specialization</span>
                    <span className="text-sm font-medium">{doctor?.specialization || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Institution</span>
                    <span className="text-sm font-medium">{doctor?.institution || "Not specified"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-4">
                  If you need to update your information or have questions about the verification process, please contact our support team.
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
} 