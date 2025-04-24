"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Calendar, 
  Clock, 
  Activity,
  FileText,
  Stethoscope,
  Pill,
  BarChart3
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

interface AppointmentSummary {
  today: number;
  upcoming: number;
  total: number;
}

interface PatientSummary {
  total: number;
  new: number;
  active: number;
}

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Mock summary data
  const appointmentSummary: AppointmentSummary = {
    today: 5,
    upcoming: 12,
    total: 145
  };

  const patientSummary: PatientSummary = {
    total: 87,
    new: 4,
    active: 73
  };

  useEffect(() => {
    // We rely on the cookie and middleware for authentication
    // Just load the doctor data from localStorage for UI display
    const storedDoctor = localStorage.getItem("doctor");
    if (storedDoctor) {
      try {
        const parsedDoctor = JSON.parse(storedDoctor);
        console.log("Using stored doctor data:", parsedDoctor.email);
        setDoctor(parsedDoctor);
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
      } catch (error: any) {
        console.error("Failed to fetch doctor data:", error);
        setError("Unable to load your information. Please sign in again.");
        
        // Clear localStorage data
        localStorage.removeItem("doctor");
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          window.location.href = "/doctor";
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
          <p className="text-muted-foreground">Loading your dashboard...</p>
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
            <Link href="/doctor">Return to Sign In</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!doctor?.isVerified) {
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

  // Doctor is verified, show dashboard
  return (
    <div className="py-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, Dr. {doctor?.fullName.split(" ")[1] || doctor?.fullName}
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary">
          <CheckCircle className="mr-1 h-3 w-3" /> Verified Professional
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Today's Appointments</p>
              <h3 className="text-2xl font-bold">{appointmentSummary.today}</h3>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm text-muted-foreground">
            <p>Upcoming: {appointmentSummary.upcoming}</p>
            <p>Total: {appointmentSummary.total}</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Patients</p>
              <h3 className="text-2xl font-bold">{patientSummary.total}</h3>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm text-muted-foreground">
            <p>New: {patientSummary.new}</p>
            <p>Active: {patientSummary.active}</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Today's Consultations</p>
              <h3 className="text-2xl font-bold">3</h3>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm text-muted-foreground">
            <p>Video: 2</p>
            <p>In-person: 1</p>
          </div>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="p-4 hover:bg-accent transition-colors">
          <Link href="/doctor/dashboard/appointments" className="flex flex-col items-center justify-center py-4">
            <div className="bg-primary/10 p-3 rounded-full mb-3">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">Appointments</h3>
          </Link>
        </Card>

        <Card className="p-4 hover:bg-accent transition-colors">
          <Link href="/doctor/dashboard/patients" className="flex flex-col items-center justify-center py-4">
            <div className="bg-primary/10 p-3 rounded-full mb-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">Patients</h3>
          </Link>
        </Card>

        <Card className="p-4 hover:bg-accent transition-colors">
          <Link href="/doctor/dashboard/consultations" className="flex flex-col items-center justify-center py-4">
            <div className="bg-primary/10 p-3 rounded-full mb-3">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">Consultations</h3>
          </Link>
        </Card>

        <Card className="p-4 hover:bg-accent transition-colors">
          <Link href="/doctor/dashboard/prescriptions" className="flex flex-col items-center justify-center py-4">
            <div className="bg-primary/10 p-3 rounded-full mb-3">
              <Pill className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">Prescriptions</h3>
          </Link>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Patients</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Alice Johnson</p>
                <p className="text-sm text-muted-foreground">Appointment today at 10:00 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Bob Smith</p>
                <p className="text-sm text-muted-foreground">Prescription renewed yesterday</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Carol Davis</p>
                <p className="text-sm text-muted-foreground">New lab results available</p>
              </div>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4" asChild>
            <Link href="/doctor/dashboard/patients">View All Patients</Link>
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-center min-w-[50px]">
                <p className="text-sm font-medium">10:00</p>
                <p className="text-xs text-muted-foreground">AM</p>
              </div>
              <div className="flex-1 rounded-md bg-muted p-2">
                <p className="font-medium">Alice Johnson</p>
                <p className="text-sm text-muted-foreground">Routine Check-up</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center min-w-[50px]">
                <p className="text-sm font-medium">11:30</p>
                <p className="text-xs text-muted-foreground">AM</p>
              </div>
              <div className="flex-1 rounded-md bg-muted p-2">
                <p className="font-medium">Bob Smith</p>
                <p className="text-sm text-muted-foreground">Diabetes Follow-up</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center min-w-[50px]">
                <p className="text-sm font-medium">2:00</p>
                <p className="text-xs text-muted-foreground">PM</p>
              </div>
              <div className="flex-1 rounded-md bg-muted p-2">
                <p className="font-medium">Carol Davis</p>
                <p className="text-sm text-muted-foreground">Consultation (Video)</p>
              </div>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4" asChild>
            <Link href="/doctor/dashboard/appointments">View Full Schedule</Link>
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Records</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Laboratory Results</p>
                <p className="text-sm text-muted-foreground">Alice Johnson - CBC</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Radiology Report</p>
                <p className="text-sm text-muted-foreground">Bob Smith - Chest X-Ray</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Visit Notes</p>
                <p className="text-sm text-muted-foreground">Carol Davis - Annual Check-up</p>
              </div>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4" asChild>
            <Link href="/doctor/dashboard/records">View All Records</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
} 