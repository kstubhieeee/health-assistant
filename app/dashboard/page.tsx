"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { format, addDays, addHours } from "date-fns";
import { 
  User, 
  UserCircle, 
  Heart, 
  Activity, 
  Stethoscope, 
  CalendarClock, 
  ChevronRight,
  ClipboardList,
  ShieldCheck,
  AlertTriangle,
  CalendarCheck,
  FileText,
  Scale,
  Bell,
  LineChart,
  TrendingUp,
  Droplets,
  Pill,
  Clock,
  Check,
  Plus,
  ListChecks,
  HeartPulse,
  BellRing,
  Calendar,
  Zap,
  Award,
  ArrowRight,
  CircleCheck,
  StepForward
} from "lucide-react";
import PatientLayout from "@/components/patient-layout";

// Define interfaces
interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
  institution: string;
  credentials: string;
  isVerified: boolean;
  avatarUrl?: string;
}

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: Date;
  status: "upcoming" | "completed" | "cancelled";
  location: string;
  avatarUrl?: string;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  date: Date;
  isRead: boolean;
  type: "appointment" | "medication" | "record" | "result" | "general";
}

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  date: Date;
  icon: React.ReactNode;
  status: "normal" | "warning" | "critical";
  change?: number;
}

interface ActivityFeedItem {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: "appointment" | "medication" | "record" | "vital" | "assessment";
  icon: React.ReactNode;
}

// Sample data
const sampleAppointments: Appointment[] = [
  {
    id: "1",
    doctorId: "d1",
    doctorName: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    date: addDays(new Date(), 3),
    status: "upcoming",
    location: "Heart Care Center, Building B",
  },
  {
    id: "2",
    doctorId: "d2",
    doctorName: "Dr. Michael Chen",
    specialty: "General Physician",
    date: addDays(new Date(), 7),
    status: "upcoming",
    location: "Primary Care Clinic, Room 105",
  }
];

const sampleNotifications: Notification[] = [
  {
    id: "n1",
    title: "Appointment Reminder",
    description: "Your appointment with Dr. Sarah Johnson is scheduled for tomorrow at 10:00 AM",
    date: addDays(new Date(), -1),
    isRead: false,
    type: "appointment"
  },
  {
    id: "n2",
    title: "Medication Refill",
    description: "Your prescription for Lisinopril is due for refill in 3 days",
    date: addDays(new Date(), -2),
    isRead: true,
    type: "medication"
  },
  {
    id: "n3",
    title: "Test Results Available",
    description: "Your recent blood work results are now available in your records",
    date: addDays(new Date(), -3),
    isRead: false,
    type: "result"
  }
];

const sampleHealthMetrics: HealthMetric[] = [
  {
    id: "m1",
    name: "Blood Pressure",
    value: 122,
    unit: "80 mmHg",
    date: new Date(),
    icon: <HeartPulse className="h-5 w-5 text-rose-500" />,
    status: "normal",
    change: -5
  },
  {
    id: "m2",
    name: "Heart Rate",
    value: 72,
    unit: "bpm",
    date: addDays(new Date(), -1),
    icon: <Heart className="h-5 w-5 text-rose-500" />,
    status: "normal",
    change: 2
  },
  {
    id: "m3",
    name: "Blood Glucose",
    value: 102,
    unit: "mg/dL",
    date: addDays(new Date(), -2),
    icon: <Droplets className="h-5 w-5 text-blue-500" />,
    status: "normal",
    change: -3
  },
  {
    id: "m4",
    name: "Weight",
    value: 165,
    unit: "lbs",
    date: addDays(new Date(), -3),
    icon: <Scale className="h-5 w-5 text-emerald-500" />,
    status: "normal",
    change: -1
  }
];

const activityFeed: ActivityFeedItem[] = [
  {
    id: "a1",
    title: "Health Assessment Completed",
    description: "You completed your monthly health assessment",
    date: addHours(new Date(), -5),
    type: "assessment",
    icon: <ClipboardList className="h-5 w-5 text-emerald-500" />
  },
  {
    id: "a2",
    title: "Blood Pressure Recorded",
    description: "You recorded a blood pressure reading of 122/80 mmHg",
    date: addHours(new Date(), -24),
    type: "vital",
    icon: <HeartPulse className="h-5 w-5 text-rose-500" />
  },
  {
    id: "a3",
    title: "Medication Taken",
    description: "You marked Lisinopril 10mg as taken",
    date: addHours(new Date(), -36),
    type: "medication",
    icon: <Pill className="h-5 w-5 text-blue-500" />
  },
];

const healthGoalProgress = 72;

const DashboardPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>(sampleAppointments);
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>(sampleHealthMetrics);
  const [activities, setActivities] = useState<ActivityFeedItem[]>(activityFeed);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const router = useRouter();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        
        if (data.user) {
          setIsAuthenticated(true);
        } else {
          // Redirect to login if not authenticated
          router.push("/auth/signin");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/auth/signin");
      } finally {
        setAuthChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  // Count unread notifications
  useEffect(() => {
    setUnreadNotifications(notifications.filter(n => !n.isRead).length);
  }, [notifications]);

  // Fetch verified doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const response = await fetch("/api/doctors/verified");
        
        if (!response.ok) {
          throw new Error("Failed to fetch doctors");
        }
        
        const data = await response.json();
        setDoctors(data.doctors);
      } catch (error: any) {
        console.error("Error fetching doctors:", error);
        setError(error.message || "Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };

    if (!authChecking) {
      fetchDoctors();
    }
  }, [isAuthenticated, authChecking]);

  // Show loading state while checking authentication
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, this should redirect, but let's show an error just in case
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Authentication Required</CardTitle>
            </div>
            <CardDescription>You need to be signed in to view this page</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Please sign in to access your patient dashboard.</p>
            <Button asChild className="w-full">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle marking a notification as read
  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  return (
    <PatientLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4 py-6">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Welcome Back, John</h1>
              <p className="text-muted-foreground">
                Here's an overview of your health
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2" asChild>
                <Link href="/check">
                  <ClipboardList className="h-4 w-4" />
                  <span>Health Assessment</span>
                </Link>
              </Button>
              
              <div className="relative">
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Health Metrics Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Health Metrics
              </h2>
              <Button variant="ghost" size="sm" className="text-sm" asChild>
                <Link href="/vitals">View All Metrics</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {healthMetrics.map((metric) => (
                <Card key={metric.id} className="bg-card hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          {metric.icon}
                        </div>
                        <span className="text-sm font-medium">{metric.name}</span>
                      </div>
                      <Badge variant={
                        metric.status === "normal" ? "outline" : 
                        metric.status === "warning" ? "secondary" : "destructive"
                      }>
                        {metric.status}
                      </Badge>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold">{metric.value}</span>
                      <span className="text-sm text-muted-foreground">{metric.unit}</span>
                      {metric.change && (
                        <Badge variant="outline" className={
                          metric.change < 0 ? "text-emerald-500" : "text-rose-500"
                        }>
                          {metric.change < 0 ? "↓" : "↑"} {Math.abs(metric.change)}%
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Last updated: {format(metric.date, "MMM d, yyyy")}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Health Goal Progress */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      <CardTitle>Health Goals</CardTitle>
                    </div>
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-800">
                      72% Complete
                    </Badge>
                  </div>
                  <CardDescription>Your progress toward better health habits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm font-medium">{healthGoalProgress}%</span>
                      </div>
                      <Progress value={healthGoalProgress} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <Zap className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Daily Activity</div>
                          <div className="text-xs text-muted-foreground">6,500 steps today</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <Droplets className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Water Intake</div>
                          <div className="text-xs text-muted-foreground">5/8 glasses</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Sleep</div>
                          <div className="text-xs text-muted-foreground">7.5 hours last night</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                          <Pill className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Medications</div>
                          <div className="text-xs text-muted-foreground">2/2 taken today</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Upcoming Appointments */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <CardTitle>Upcoming Appointments</CardTitle>
                  </div>
                  <CardDescription>Your scheduled doctor appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  {appointments.length > 0 ? (
                    <div className="space-y-3">
                      {appointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center gap-4 p-3 rounded-lg border">
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {appointment.doctorName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{appointment.doctorName}</div>
                            <div className="text-sm text-muted-foreground">{appointment.specialty}</div>
                            <div className="text-xs flex items-center gap-1 mt-1">
                              <CalendarClock className="h-3 w-3" />
                              <span>{format(appointment.date, "EEEE, MMM d • h:mm a")}</span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">Reschedule</Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                        <Link href="/appointments">
                          View All Appointments
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <CalendarClock className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                      <p>No upcoming appointments</p>
                      <Button variant="outline" size="sm" className="mt-2" asChild>
                        <Link href="/appointments">Schedule Appointment</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Activity Feed */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-primary" />
                    <CardTitle>Recent Activity</CardTitle>
                  </div>
                  <CardDescription>Your recent health-related activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex gap-3 p-3 rounded-lg border">
                        <div className="bg-primary/10 h-10 w-10 rounded-full flex items-center justify-center shrink-0">
                          {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{activity.title}</div>
                          <div className="text-sm text-muted-foreground">{activity.description}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {format(activity.date, "MMM d, yyyy • h:mm a")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              {/* Notifications */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BellRing className="h-5 w-5 text-primary" />
                      <CardTitle>Notifications</CardTitle>
                    </div>
                    {unreadNotifications > 0 && (
                      <Badge>{unreadNotifications} new</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 4).map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-3 rounded-lg border ${notification.isRead ? '' : 'bg-primary/5 border-primary/20'}`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`rounded-full p-1.5 ${
                              notification.type === 'appointment' ? 'bg-blue-100 text-blue-600' :
                              notification.type === 'medication' ? 'bg-amber-100 text-amber-600' :
                              notification.type === 'result' ? 'bg-emerald-100 text-emerald-600' :
                              'bg-primary/10 text-primary'
                            }`}>
                              {notification.type === 'appointment' ? <Calendar className="h-3.5 w-3.5" /> :
                               notification.type === 'medication' ? <Pill className="h-3.5 w-3.5" /> :
                               notification.type === 'result' ? <FileText className="h-3.5 w-3.5" /> :
                               <Bell className="h-3.5 w-3.5" />
                              }
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-sm">{notification.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {format(notification.date, "MMM d")}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                              {!notification.isRead && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="mt-1 h-7 text-xs p-0"
                                  onClick={() => markNotificationAsRead(notification.id)}
                                >
                                  Mark as read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Bell className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                        <p>No notifications</p>
                      </div>
                    )}
                    {notifications.length > 4 && (
                      <Button variant="ghost" size="sm" className="w-full text-xs">
                        Show all {notifications.length} notifications
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Links */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="h-auto flex flex-col items-center py-4 px-2 rounded-lg" asChild>
                      <Link href="/vitals">
                        <Activity className="h-5 w-5 mb-1" />
                        <span className="text-xs">Vital Signs</span>
                      </Link>
                    </Button>
                    
                    <Button variant="outline" className="h-auto flex flex-col items-center py-4 px-2 rounded-lg" asChild>
                      <Link href="/appointments">
                        <Calendar className="h-5 w-5 mb-1" />
                        <span className="text-xs">Appointments</span>
                      </Link>
                    </Button>
                    
                    <Button variant="outline" className="h-auto flex flex-col items-center py-4 px-2 rounded-lg" asChild>
                      <Link href="/records">
                        <FileText className="h-5 w-5 mb-1" />
                        <span className="text-xs">Medical Records</span>
                      </Link>
                    </Button>
                    
                    <Button variant="outline" className="h-auto flex flex-col items-center py-4 px-2 rounded-lg" asChild>
                      <Link href="/bmi">
                        <Scale className="h-5 w-5 mb-1" />
                        <span className="text-xs">BMI Calculator</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Doctor Recommendation */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Recommended Doctor</CardTitle>
                  <CardDescription>Based on your health profile</CardDescription>
                </CardHeader>
                <CardContent>
                  {!loading && doctors.length > 0 ? (
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {doctors[0].fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-base">{doctors[0].fullName}</div>
                        <div className="text-sm text-muted-foreground">{doctors[0].specialization}</div>
                        <div className="text-xs text-muted-foreground">{doctors[0].institution}</div>
                        <Button variant="link" size="sm" className="pl-0 h-7" asChild>
                          <Link href={`/doctor-profile/${doctors[0].id}`}>
                            View Profile
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <UserCircle className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                      <p>No doctor recommendations yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
    </div>
    </PatientLayout>
  );
};

export default DashboardPage;

