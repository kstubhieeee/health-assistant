"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { 
  Calendar,
  Clock,
  AlertTriangle, 
  User, 
  Stethoscope, 
  UserCircle, 
  MapPin, 
  ChevronRight, 
  Filter, 
  Search, 
  X,
  CalendarCheck 
} from "lucide-react";
import PatientLayout from "@/components/patient-layout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, addDays, addWeeks } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Doctor interface
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  reviewCount: number;
  availability: {
    nextAvailable: Date;
    slots: {
      date: Date;
      times: string[];
    }[];
  };
  image?: string;
  credentials: string;
  yearsExperience: number;
}

// Appointment interface
interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: Date;
  status: "upcoming" | "completed" | "cancelled";
  location: string;
}

// Mock data for appointments
const mockAppointments: Appointment[] = [
  {
    id: "a1",
    doctorId: "d1",
    doctorName: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    date: addDays(new Date(), 7),
    status: "upcoming",
    location: "Heart Care Medical Center, Room 305"
  }
];

export default function AppointmentsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState("appointments");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isSchedulingOpen, setIsSchedulingOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [schedulingReason, setSchedulingReason] = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [doctorsError, setDoctorsError] = useState("");

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        
        if (data.user) {
          setIsAuthenticated(true);
        } else {
          // Redirect to home if not authenticated
          router.push("/");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/");
      } finally {
        setAuthChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  // Fetch doctors from the API
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoadingDoctors(true);
        setDoctorsError("");
        
        const response = await fetch("/api/doctors/available");
        
        if (!response.ok) {
          throw new Error("Failed to fetch available doctors");
        }
        
        const data = await response.json();
        
        // Parse date strings back to Date objects
        const parsedDoctors = data.doctors.map((doctor: any) => ({
          ...doctor,
          availability: {
            nextAvailable: new Date(doctor.availability.nextAvailable),
            slots: doctor.availability.slots.map((slot: any) => ({
              date: new Date(slot.date),
              times: slot.times
            }))
          }
        }));
        
        setDoctors(parsedDoctors);
        setFilteredDoctors(parsedDoctors);
      } catch (error: any) {
        console.error("Error fetching doctors:", error);
        setDoctorsError(error.message || "Failed to load available doctors");
      } finally {
        setLoadingDoctors(false);
      }
    };

    if (!authChecking && isAuthenticated) {
      fetchDoctors();
    }
  }, [isAuthenticated, authChecking]);

  // Filter doctors based on search and specialty
  useEffect(() => {
    if (doctors.length === 0) return;
    
    let filtered = [...doctors];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        doctor => 
          doctor.name.toLowerCase().includes(query) ||
          doctor.specialty.toLowerCase().includes(query) ||
          doctor.hospital.toLowerCase().includes(query)
      );
    }

    if (selectedSpecialty !== "all") {
      filtered = filtered.filter(
        doctor => doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase()
      );
    }

    setFilteredDoctors(filtered);
  }, [searchQuery, selectedSpecialty, doctors]);

  // Function to schedule an appointment
  const scheduleAppointment = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;

    const newAppointment: Appointment = {
      id: `a${appointments.length + 1}`,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      date: new Date(selectedDate),
      status: "upcoming",
      location: `${selectedDoctor.hospital}, Room ${Math.floor(Math.random() * 400) + 100}`
    };

    setAppointments([...appointments, newAppointment]);
    setIsSchedulingOpen(false);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSchedulingReason("");
    setActiveTab("appointments");
  };

  // Get unique specialties for filtering
  const specialties = Array.from(new Set(doctors.map(doctor => doctor.specialty)));

  // Show loading state while checking authentication
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <PatientLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h1 className="text-3xl font-bold">Appointments</h1>
            <Button 
              onClick={() => {
                setActiveTab("doctors");
                setSelectedDoctor(null);
              }}
            >
              Schedule New Appointment
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="appointments">My Appointments</TabsTrigger>
              <TabsTrigger value="doctors">Available Doctors</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appointments">
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <CardTitle>Upcoming Appointments</CardTitle>
                    </div>
                  </div>
                  <CardDescription>
                    Your scheduled doctor appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {appointments.length > 0 ? (
                    <div className="space-y-4">
                      {appointments.map(appointment => (
                        <div key={appointment.id} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border rounded-lg">
                          <div className="flex-shrink-0">
                            <Avatar className="h-14 w-14 border-2 border-primary/20">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {appointment.doctorName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{appointment.doctorName}</h3>
                            <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <CalendarCheck className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">
                                {format(appointment.date, "EEEE, MMMM d, yyyy")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">10:00 AM</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 w-full md:w-auto mt-2 md:mt-0">
                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                              {appointment.status}
                            </Badge>
                            <Button variant="outline" size="sm">Reschedule</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>You don't have any upcoming appointments.</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setActiveTab("doctors")}
                      >
                        Schedule Now
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Past Appointments</CardTitle>
                  <CardDescription>
                    View your appointment history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-8 text-muted-foreground">
                    <p>No past appointments found.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="doctors">
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Find Doctors</CardTitle>
                  </div>
                  <CardDescription>Browse and schedule with available healthcare providers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Search by name, specialty, or hospital"
                          className="pl-9"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                          <button 
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <Select
                        defaultValue="all"
                        value={selectedSpecialty}
                        onValueChange={setSelectedSpecialty}
                      >
                        <SelectTrigger className="w-full md:w-[200px]">
                          <SelectValue placeholder="Filter by specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Specialties</SelectItem>
                          {specialties.map(specialty => (
                            <SelectItem key={specialty} value={specialty.toLowerCase()}>
                              {specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {loadingDoctors ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : doctorsError ? (
                    <div className="text-center p-8 text-destructive">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive/50" />
                      <p>{doctorsError}</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => {
                          setActiveTab("appointments");
                        }}
                      >
                        Back to Appointments
                      </Button>
                    </div>
                  ) : filteredDoctors.length > 0 ? (
                    <div className="space-y-4">
                      {filteredDoctors.map(doctor => (
                        <Card key={doctor.id} className="overflow-hidden border hover:shadow-md transition-all duration-200">
                          <CardContent className="p-0">
                            <div className="p-4 flex flex-col md:flex-row gap-4">
                              <div className="flex-shrink-0">
                                <Avatar className="h-16 w-16 border-2 border-primary/20">
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {doctor.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                  <div>
                                    <h3 className="font-medium">{doctor.name}</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                        {doctor.specialty}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">{doctor.credentials}</span>
                                    </div>
                                  </div>
                                  <div className="mt-2 md:mt-0">
                                    <div className="flex items-center gap-1 text-amber-500">
                                      {"★".repeat(Math.floor(doctor.rating))}
                                      <span className="text-sm text-muted-foreground">({doctor.reviewCount})</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="mt-2 space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      {doctor.hospital}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <CalendarCheck className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      Next available: {format(doctor.availability.nextAvailable, "EEEE, MMMM d")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="px-4 py-3 bg-muted/30 flex flex-col sm:flex-row justify-between items-center gap-2">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Experience: </span>
                                <span className="font-medium">{doctor.yearsExperience} years</span>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedDoctor(doctor);
                                    setIsSchedulingOpen(true);
                                  }}
                                >
                                  Schedule Appointment
                                </Button>
                                <Button variant="ghost" size="sm">View Profile</Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      <Stethoscope className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>No doctors found matching your search criteria.</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedSpecialty("all");
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Appointment Scheduling Dialog */}
      <Dialog open={isSchedulingOpen} onOpenChange={setIsSchedulingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
            <DialogDescription>
              {selectedDoctor ? `Book an appointment with ${selectedDoctor.name}` : "Select date and time for your appointment"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDoctor && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedDoctor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedDoctor.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedDoctor.specialty}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reason">Reason for visit</Label>
                  <Input
                    id="reason"
                    placeholder="Briefly describe your symptoms or reason"
                    value={schedulingReason}
                    onChange={(e) => setSchedulingReason(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Select date</Label>
                  <RadioGroup 
                    value={selectedDate?.toISOString() || ""}
                    onValueChange={(value) => setSelectedDate(new Date(value))}
                    className="mt-2 space-y-2"
                  >
                    {selectedDoctor.availability.slots.map((slot) => (
                      <div key={slot.date.toISOString()} className="flex items-center space-x-2">
                        <RadioGroupItem value={slot.date.toISOString()} id={slot.date.toISOString()} />
                        <Label htmlFor={slot.date.toISOString()} className="cursor-pointer">
                          {format(slot.date, "EEEE, MMMM d, yyyy")}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                {selectedDate && (
                  <div>
                    <Label>Select time</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {selectedDoctor.availability.slots
                        .find(slot => slot.date.toDateString() === selectedDate.toDateString())
                        ?.times.map(time => (
                          <Button
                            key={time}
                            type="button"
                            variant={selectedTime === time ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </Button>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsSchedulingOpen(false);
                setSelectedDoctor(null);
                setSelectedDate(null);
                setSelectedTime(null);
                setSchedulingReason("");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={scheduleAppointment}
              disabled={!selectedDoctor || !selectedDate || !selectedTime}
            >
              Schedule Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PatientLayout>
  );
} 