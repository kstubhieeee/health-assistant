"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Activity, 
  Calendar, 
  Clock, 
  Heart, 
  History, 
  Thermometer, 
  Droplet,
  Users,
  User,
  CalendarClock,
  BookOpenCheck,
  Award
} from "lucide-react";
import { PatientLayout } from "@/components/patient-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateDisplay } from "@/components/date-display";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Simulate checking user session
        const session = localStorage.getItem("userSession");
        
        if (!session) {
          router.push("/sign-in");
          return;
        }
        
        // Parse user data
        const userData = JSON.parse(session);
        setUserData(userData);
        
        // Fetch doctors data
        fetchDoctors();
      } catch (error) {
        console.error("Session check error:", error);
        setError("Failed to verify your session");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockDoctors = [
        { id: 1, name: "Dr. Sarah Johnson", specialty: "Cardiologist", available: true, avatar: "/avatars/doctor-1.png" },
        { id: 2, name: "Dr. Michael Chen", specialty: "General Physician", available: false, avatar: "/avatars/doctor-2.png" },
        { id: 3, name: "Dr. Emily Wilson", specialty: "Neurologist", available: true, avatar: "/avatars/doctor-3.png" }
      ];
      
      setDoctors(mockDoctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setError("Failed to load doctors");
    } finally {
      setLoadingDoctors(false);
    }
  };

  const getLastVitals = () => {
    try {
      const vitalsString = localStorage.getItem("vitalsData");
      if (!vitalsString) return null;
      
      const vitals = JSON.parse(vitalsString);
      if (!Array.isArray(vitals) || vitals.length === 0) return null;
      
      // Sort by date (newest first) and return the first item
      return vitals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    } catch (error) {
      console.error("Error getting last vitals:", error);
      return null;
    }
  };

  const getUpcomingAppointments = () => {
    try {
      const appointmentsString = localStorage.getItem("appointments");
      if (!appointmentsString) return [];
      
      const appointments = JSON.parse(appointmentsString);
      if (!Array.isArray(appointments)) return [];
      
      // Filter to only get future appointments, then sort by date
      const now = new Date();
      return appointments
        .filter(app => new Date(app.date) > now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3); // Get first 3 upcoming appointments
    } catch (error) {
      console.error("Error getting appointments:", error);
      return [];
    }
  };

  if (loading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </PatientLayout>
    );
  }

  const lastVitals = getLastVitals();
  const upcomingAppointments = getUpcomingAppointments();

  return (
    <PatientLayout>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg mb-6">
        <h1 className="text-2xl font-bold">Welcome back, {userData?.name || "Patient"}</h1>
        <p className="opacity-90">Here's an overview of your health dashboard</p>
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-3 gap-4">
          <TabsTrigger value="overview" className="flex gap-2">
            <Activity size={16} />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="vitals" className="flex gap-2">
            <Heart size={16} />
            <span className="hidden sm:inline">Vitals</span>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex gap-2">
            <Calendar size={16} />
            <span className="hidden sm:inline">Appointments</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Quick Health Stats
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Blood Pressure Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Droplet className="mr-2 h-4 w-4 text-rose-500" />
                    Blood Pressure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lastVitals ? (
                    <div className="text-2xl font-bold">
                      {lastVitals.systolic}/{lastVitals.diastolic} <span className="text-sm font-normal text-muted-foreground">mmHg</span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">No data recorded</div>
                  )}
                </CardContent>
                {lastVitals && (
                  <CardFooter className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      Recorded <DateDisplay date={new Date(lastVitals.date)} relative />
                    </p>
                  </CardFooter>
                )}
              </Card>

              {/* Heart Rate Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Heart className="mr-2 h-4 w-4 text-red-500" />
                    Heart Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lastVitals ? (
                    <div className="text-2xl font-bold">
                      {lastVitals.heartRate} <span className="text-sm font-normal text-muted-foreground">bpm</span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">No data recorded</div>
                  )}
                </CardContent>
                {lastVitals && (
                  <CardFooter className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      Recorded <DateDisplay date={new Date(lastVitals.date)} relative />
                    </p>
                  </CardFooter>
                )}
              </Card>

              {/* Temperature Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Thermometer className="mr-2 h-4 w-4 text-orange-500" />
                    Body Temperature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lastVitals ? (
                    <div className="text-2xl font-bold">
                      {lastVitals.temperature} <span className="text-sm font-normal text-muted-foreground">°F</span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">No data recorded</div>
                  )}
                </CardContent>
                {lastVitals && (
                  <CardFooter className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      Recorded <DateDisplay date={new Date(lastVitals.date)} relative />
                    </p>
                  </CardFooter>
                )}
              </Card>

              {/* Oxygen Saturation Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Activity className="mr-2 h-4 w-4 text-blue-500" />
                    Oxygen Saturation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lastVitals ? (
                    <div className="text-2xl font-bold">
                      {lastVitals.oxygenSaturation} <span className="text-sm font-normal text-muted-foreground">%</span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">No data recorded</div>
                  )}
                </CardContent>
                {lastVitals && (
                  <CardFooter className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      Recorded <DateDisplay date={new Date(lastVitals.date)} relative />
                    </p>
                  </CardFooter>
                )}
              </Card>
            </div>
          </section>

          {/* Health Activity Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Activity Summary */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="mr-2 h-5 w-5" />
                  Health Activity
                </CardTitle>
                <CardDescription>
                  Your recent health activities and assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <BookOpenCheck className="h-8 w-8 mt-0.5 text-primary bg-primary/10 p-1.5 rounded-full" />
                    <div className="space-y-1">
                      <p className="font-medium">Health Assessment</p>
                      <p className="text-sm text-muted-foreground">Completed initial health assessment</p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start space-x-4">
                    <CalendarClock className="h-8 w-8 mt-0.5 text-blue-500 bg-blue-500/10 p-1.5 rounded-full" />
                    <div className="space-y-1">
                      <p className="font-medium">Appointment Scheduled</p>
                      <p className="text-sm text-muted-foreground">Annual checkup with Dr. Chen</p>
                      <p className="text-xs text-muted-foreground">Last week</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start space-x-4">
                    <Award className="h-8 w-8 mt-0.5 text-green-500 bg-green-500/10 p-1.5 rounded-full" />
                    <div className="space-y-1">
                      <p className="font-medium">Health Goal Achieved</p>
                      <p className="text-sm text-muted-foreground">Maintained normal blood pressure for 30 days</p>
                      <p className="text-xs text-muted-foreground">1 month ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push("/records")}>
                  View All Health Records
                </Button>
              </CardFooter>
            </Card>

            {/* Upcoming Appointments Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Upcoming Appointments
                </CardTitle>
                <CardDescription>
                  Your next scheduled appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="bg-primary/10 text-primary p-2 rounded-full">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">{appointment.title}</p>
                          <p className="text-sm text-muted-foreground">
                            <DateDisplay date={new Date(appointment.date)} format="PPP" />
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No upcoming appointments</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push("/appointments")}>
                  Schedule Appointment
                </Button>
              </CardFooter>
            </Card>
          </section>

          {/* Available Doctors */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Available Doctors
            </h2>
            
            {loadingDoctors ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : doctors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map(doctor => (
                  <Card key={doctor.id}>
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-slate-500" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{doctor.name}</CardTitle>
                          <CardDescription>{doctor.specialty}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Badge variant={doctor.available ? "success" : "secondary"} className="mb-2">
                        {doctor.available ? "Available" : "Unavailable"}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Specializes in cardiovascular diseases and preventive care.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant={doctor.available ? "default" : "outline"} 
                        className="w-full"
                        disabled={!doctor.available}
                      >
                        Book Consultation
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No doctors available</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    We couldn't load the list of available doctors at this time.
                  </p>
                  <Button onClick={fetchDoctors}>Retry Loading</Button>
                </CardContent>
              </Card>
            )}
          </section>
        </TabsContent>

        {/* Vitals Tab */}
        <TabsContent value="vitals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="mr-2 h-5 w-5" />
                Your Vital Signs
              </CardTitle>
              <CardDescription>
                Track and monitor your vital signs over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lastVitals ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Blood Pressure Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Blood Pressure</span>
                        <span className="text-sm text-muted-foreground">{lastVitals.systolic}/{lastVitals.diastolic} mmHg</span>
                      </div>
                      <Progress value={85} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {lastVitals.systolic < 120 && lastVitals.diastolic < 80 
                          ? "Normal" 
                          : lastVitals.systolic < 130 && lastVitals.diastolic < 80 
                          ? "Elevated" 
                          : "High"}
                      </p>
                    </div>

                    {/* Heart Rate Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Heart Rate</span>
                        <span className="text-sm text-muted-foreground">{lastVitals.heartRate} bpm</span>
                      </div>
                      <Progress value={70} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {lastVitals.heartRate >= 60 && lastVitals.heartRate <= 100 
                          ? "Normal" 
                          : lastVitals.heartRate < 60 
                          ? "Below normal" 
                          : "Above normal"}
                      </p>
                    </div>

                    {/* Temperature Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Body Temperature</span>
                        <span className="text-sm text-muted-foreground">{lastVitals.temperature} °F</span>
                      </div>
                      <Progress value={95} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {lastVitals.temperature >= 97 && lastVitals.temperature <= 99 
                          ? "Normal" 
                          : lastVitals.temperature < 97 
                          ? "Below normal" 
                          : "Above normal"}
                      </p>
                    </div>

                    {/* Oxygen Saturation Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Oxygen Saturation</span>
                        <span className="text-sm text-muted-foreground">{lastVitals.oxygenSaturation}%</span>
                      </div>
                      <Progress value={98} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {lastVitals.oxygenSaturation >= 95 
                          ? "Normal" 
                          : lastVitals.oxygenSaturation >= 90 
                          ? "Slightly low" 
                          : "Low"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <p className="text-sm mb-2">Last recorded: <DateDisplay date={new Date(lastVitals.date)} format="PPPp" /></p>
                    <Button onClick={() => router.push("/vitals")} className="w-full md:w-auto">
                      View Full Vitals History
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Heart className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-1">No vitals recorded yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start tracking your vital signs to monitor your health over time
                    </p>
                    <Button onClick={() => router.push("/vitals")}>
                      Record Your Vitals
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Your Appointments
              </CardTitle>
              <CardDescription>
                Manage your upcoming medical appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment, index) => (
                    <div key={index} className="flex p-4 border rounded-lg">
                      <div className="mr-4 flex flex-col items-center justify-center bg-slate-100 p-3 rounded-lg">
                        <span className="text-xl font-bold">{new Date(appointment.date).getDate()}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(appointment.date).toLocaleString('default', { month: 'short' })}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{appointment.title}</h3>
                        <p className="text-sm text-muted-foreground mb-1">{appointment.doctor}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(appointment.date).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Badge variant="outline" className="ml-2">
                          {appointment.type || "Check-up"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4">
                    <Button onClick={() => router.push("/appointments")} className="w-full md:w-auto">
                      Manage All Appointments
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-1">No upcoming appointments</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Schedule your first appointment with one of our doctors
                    </p>
                    <Button onClick={() => router.push("/appointments")}>
                      Schedule Appointment
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PatientLayout>
  );
}

