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
  CalendarCheck,
  Video,
  ExternalLink 
} from "lucide-react";
import PatientLayout from "@/components/patient-layout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, addDays, parseISO } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

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

// Appointment interface from API
interface Appointment {
  _id: string;
  doctor: {
    _id: string;
    fullName: string;
    specialization: string;
    institution: string;
  };
  date: string;
  time: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  meetingLink?: string;
  createdAt: string;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState("appointments");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState("all");

  // Function to get meeting link from localStorage
  const getMeetingLinkFromStorage = (appointmentId: string): string | null => {
    if (typeof window === "undefined") {
      console.log('[DEBUG] getMeetingLinkFromStorage called server-side for appointment:', appointmentId);
      return null;
    }
    
    try {
      console.log(`[DEBUG] Attempting to get meeting link from storage for appointment: ${appointmentId}`);
      const storageKey = `meetingLink_${appointmentId}`;
      const storedLink = localStorage.getItem(storageKey);
      
      if (storedLink) {
        console.log(`[DEBUG] Found meeting link in storage for appointment ${appointmentId}: ${storedLink}`);
        return storedLink;
      } else {
        console.log(`[DEBUG] No meeting link in storage for appointment ${appointmentId}`);
        return null;
      }
    } catch (error) {
      console.error(`[DEBUG] Error accessing localStorage for appointment ${appointmentId}:`, error);
      return null;
    }
  };

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('[DEBUG] Checking authentication status');
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        console.log('[DEBUG] Auth session data:', JSON.stringify(data));
        
        if (data.user) {
          console.log('[DEBUG] User authenticated:', data.user.email);
          setIsAuthenticated(true);
        } else {
          console.log('[DEBUG] User not authenticated, redirecting to home');
          // Redirect to home if not authenticated
          router.push("/");
        }
      } catch (error) {
        console.error("[DEBUG] Auth check error:", error);
        router.push("/");
      } finally {
        setAuthChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  // Fetch appointments from the API
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoadingAppointments(true);
        setAppointmentsError("");
        
        console.log('[DEBUG] Fetching appointments from API');
        const response = await fetch("/api/appointments");
        
        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }
        
        const data = await response.json();
        console.log('[DEBUG] Raw appointments data from API:', JSON.stringify(data));
        console.log('[DEBUG] Patient appointments fetched:', JSON.stringify(data.appointments));
        
        // Check for approved appointments with meeting links
        const approvedWithLinks = data.appointments.filter(
          (app: {status: string; meetingLink?: string}) => app.status === "approved" && app.meetingLink
        );
        console.log('[DEBUG] Approved appointments with meeting links:', JSON.stringify(approvedWithLinks));
        console.log('[DEBUG] Meeting links in approved appointments:', approvedWithLinks.map((app: any) => app.meetingLink));
        
        // Enhance appointments with localStorage meeting links if needed
        const enhancedAppointments = data.appointments.map((appointment: Appointment) => {
          console.log(`[DEBUG] Processing appointment ${appointment._id}, status: ${appointment.status}, has meeting link: ${!!appointment.meetingLink}`);
          if (appointment.status === "approved" && !appointment.meetingLink) {
            const storedLink = getMeetingLinkFromStorage(appointment._id);
            console.log(`[DEBUG] For appointment ${appointment._id}, localStorage link:`, storedLink);
            if (storedLink) {
              console.log(`[DEBUG] Using localStorage meeting link for appointment ${appointment._id}`);
              return {
                ...appointment,
                meetingLink: storedLink,
                meetingLinkSource: 'localStorage'
              };
            }
          }
          return appointment;
        });
        
        console.log('[DEBUG] Enhanced appointments:', JSON.stringify(enhancedAppointments));
        setAppointments(enhancedAppointments || []);
      } catch (error: any) {
        console.error("[DEBUG] Error fetching appointments:", error);
        setAppointmentsError(error.message || "Failed to load appointments");
      } finally {
        setLoadingAppointments(false);
      }
    };

    if (!authChecking && isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated, authChecking]);

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

    if (!authChecking && isAuthenticated && activeTab === "find-doctor") {
      fetchDoctors();
    }
  }, [isAuthenticated, authChecking, activeTab]);

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

  // Filter appointments based on status
  const filteredAppointments = appointments.filter(appointment => 
    appointmentStatusFilter === "all" || appointment.status === appointmentStatusFilter
  );

  // Function to schedule an appointment
  const scheduleAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !schedulingReason) {
      // Display error without toast
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const appointmentData = {
        doctorId: selectedDoctor.id,
        date: selectedDate.toISOString(),
        time: selectedTime,
        reason: schedulingReason,
      };
      
      console.log('[DEBUG] Scheduling appointment with data:', JSON.stringify(appointmentData));
      
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });
      
      console.log('[DEBUG] Appointment creation response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[DEBUG] Appointment creation error:', errorData);
        throw new Error(errorData.error || "Failed to create appointment");
      }
      
      const data = await response.json();
      console.log('[DEBUG] New appointment created:', JSON.stringify(data.appointment));
      
      // Add the new appointment to the state
      setAppointments(prevAppointments => {
        console.log('[DEBUG] Adding new appointment to state:', JSON.stringify(data.appointment));
        return [data.appointment, ...prevAppointments];
      });
      
      // Reset form and close dialog
      setSelectedDoctor(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setSchedulingReason("");
      setIsSchedulingOpen(false);
      
      // Switch to appointments tab
      setActiveTab("appointments");
      
      // Show success message without toast
      alert("Appointment request has been sent to the doctor");
    } catch (error: any) {
      console.error("[DEBUG] Error scheduling appointment:", error);
      // Show error without toast
      alert(error.message || "Failed to schedule appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle appointment cancellation
  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      console.log(`[DEBUG] Attempting to cancel appointment: ${appointmentId}`);
      setIsCancelling(appointmentId);
      
      const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: "PUT",
      });
      
      console.log(`[DEBUG] Cancel appointment response status: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[DEBUG] Cancel appointment error:', errorData);
        throw new Error(errorData.error || "Failed to cancel appointment");
      }
      
      const data = await response.json();
      console.log('[DEBUG] Appointment cancelled successfully:', JSON.stringify(data));
      
      // Update the appointments list
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status: "cancelled" }
            : appointment
        )
      );
      
      alert("Appointment cancelled successfully");
    } catch (error: any) {
      console.error("[DEBUG] Error cancelling appointment:", error);
      alert(error.message || "Failed to cancel appointment");
    } finally {
      setIsCancelling("");
    }
  };

  if (authChecking) {
    return (
      <PatientLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Appointments</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="appointments">My Appointments</TabsTrigger>
            <TabsTrigger value="find-doctor">Find a Doctor</TabsTrigger>
          </TabsList>

          {/* My Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="flex justify-between items-center">
              <Select 
                value={appointmentStatusFilter} 
                onValueChange={setAppointmentStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Appointments</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loadingAppointments ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : appointmentsError ? (
              <div className="bg-red-50 p-4 rounded-md text-red-500 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <p>{appointmentsError}</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <CalendarCheck className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-lg font-medium">No appointments found</p>
                <p className="mb-4">You don't have any appointments yet.</p>
                <Button onClick={() => setActiveTab("find-doctor")}>
                  Find a Doctor
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredAppointments.map((appointment) => (
                  <Card key={appointment._id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Dr. {appointment.doctor.fullName}</CardTitle>
                          <CardDescription>{appointment.doctor.specialization}</CardDescription>
                        </div>
                        <Badge variant={
                          appointment.status === "pending" ? "outline" :
                          appointment.status === "approved" ? "success" : "destructive"
                        }>
                          {appointment.status === "pending" ? "Pending" :
                           appointment.status === "approved" ? "Approved" : "Rejected"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {new Date(appointment.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{appointment.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{appointment.doctor.institution}</span>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-sm font-medium">Reason for visit:</p>
                          <p className="text-sm text-gray-600">{appointment.reason}</p>
                        </div>
                        
                        {appointment.status === "approved" && (appointment.meetingLink || getMeetingLinkFromStorage(appointment._id)) && (
                          <div className="mt-2 p-3 bg-green-50 rounded-md">
                            <div className="flex items-center gap-2 mb-2">
                              <Video className="h-4 w-4 text-green-600" />
                              <p className="text-sm font-medium">Meeting Link:</p>
                            </div>
                            {console.log(`[DEBUG] Rendering meeting link for appointment ${appointment._id}:`, appointment.meetingLink || getMeetingLinkFromStorage(appointment._id))}
                            <a 
                              href={appointment.meetingLink || getMeetingLinkFromStorage(appointment._id)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-blue-600 hover:underline break-all"
                            >
                              {appointment.meetingLink || getMeetingLinkFromStorage(appointment._id)}
                              <ExternalLink className="h-3 w-3" />
                              {!appointment.meetingLink && appointment.meetingLinkSource === 'localStorage' && (
                                <span className="text-xs ml-1 text-gray-500">(from local storage)</span>
                              )}
                            </a>
                            <p className="text-xs text-gray-500 mt-1">
                              Click the link above to join your virtual appointment at the scheduled time.
                            </p>
                            
                          </div>
                        )}
                        
                        {appointment.status === "approved" && !appointment.meetingLink && !getMeetingLinkFromStorage(appointment._id) && (
                          <div className="mt-2 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4 text-yellow-600" />
                              <p className="text-sm font-medium text-yellow-800">
                                Your appointment has been approved. The meeting link will be added soon.
                              </p>
                            </div>
                            {console.log(`[DEBUG] No meeting link for approved appointment ${appointment._id}`)}
                            {true && (
                              <p className="text-xs text-gray-500 mt-1 border-t pt-1">
                                Debug: No meeting link found in DB or localStorage. MongoDB appointment data: {JSON.stringify({
                                  id: appointment._id,
                                  status: appointment.status,
                                  meetingLink: appointment.meetingLink,
                                  doctor: appointment.doctor._id
                                })}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {appointment.status === "rejected" && appointment.rejectionReason && (
                          <div className="mt-2 p-3 bg-red-50 rounded-md">
                            <p className="text-sm font-medium text-red-800">Reason for rejection:</p>
                            <p className="text-sm text-red-700">{appointment.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end pt-0">
                      {appointment.status === "pending" && (
                        <Button variant="outline" size="sm">
                          Cancel Request
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Find a Doctor Tab */}
          <TabsContent value="find-doctor" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search doctors by name, specialty, or hospital"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  <SelectItem value="cardiologist">Cardiologist</SelectItem>
                  <SelectItem value="dermatologist">Dermatologist</SelectItem>
                  <SelectItem value="neurologist">Neurologist</SelectItem>
                  <SelectItem value="pediatrician">Pediatrician</SelectItem>
                  <SelectItem value="orthopedic">Orthopedic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loadingDoctors ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : doctorsError ? (
              <div className="bg-red-50 p-4 rounded-md text-red-500 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <p>{doctorsError}</p>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <Stethoscope className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-lg font-medium">No doctors found</p>
                <p>Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredDoctors.map((doctor) => (
                  <Card key={doctor.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={doctor.image} alt={doctor.name} />
                          <AvatarFallback>
                            <UserCircle className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle>{doctor.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <Stethoscope className="h-3 w-3" />
                            <span>{doctor.specialty}</span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{doctor.hospital}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{doctor.yearsExperience} years experience</span>
                          </div>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-sm font-medium">Credentials:</span>
                            <span className="text-sm">{doctor.credentials}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Next Available:</p>
                          <p className="text-sm">
                            {format(doctor.availability.nextAvailable, "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          setIsSchedulingOpen(true);
                        }}
                      >
                        Schedule Appointment
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Appointment Scheduling Dialog */}
      <Dialog open={isSchedulingOpen} onOpenChange={setIsSchedulingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
            <DialogDescription>
              {selectedDoctor ? `with Dr. ${selectedDoctor.name}, ${selectedDoctor.specialty}` : ""}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDoctor && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="date">Select Date</Label>
                <RadioGroup id="date" value={selectedDate?.toISOString() || ""} onValueChange={(value) => setSelectedDate(new Date(value))}>
                  {selectedDoctor.availability.slots.map((slot, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={slot.date.toISOString()} id={`date-${index}`} />
                      <Label htmlFor={`date-${index}`}>{format(slot.date, "EEEE, MMMM d, yyyy")}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              {selectedDate && (
                <div className="space-y-2">
                  <Label htmlFor="time">Select Time</Label>
                  <RadioGroup id="time" value={selectedTime || ""} onValueChange={setSelectedTime}>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedDoctor.availability.slots
                        .find(slot => slot.date.toDateString() === selectedDate.toDateString())
                        ?.times.map((time, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <RadioGroupItem value={time} id={`time-${index}`} />
                            <Label htmlFor={`time-${index}`}>{time}</Label>
                          </div>
                        ))}
                    </div>
                  </RadioGroup>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit</Label>
                <Textarea
                  id="reason"
                  placeholder="Please briefly describe your symptoms or reason for the appointment"
                  value={schedulingReason}
                  onChange={(e) => setSchedulingReason(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSchedulingOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={scheduleAppointment}
              disabled={!selectedDoctor || !selectedDate || !selectedTime || !schedulingReason || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                "Request Appointment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PatientLayout>
  );
} 