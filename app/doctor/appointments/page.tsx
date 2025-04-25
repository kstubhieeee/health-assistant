"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { CalendarClock, Check, X, Clock, Calendar, AlertTriangle, ClipboardList, Video } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import DoctorLayout from "@/components/doctor-layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { NextRequest, NextResponse } from 'next/server';

// Appointment interface
interface Appointment {
  _id: string;
  patient: {
    _id: string;
    name: string;
    email: string;
  };
  patientDetails?: {
    name: string;
    email: string;
  };
  date: string;
  time: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string | null;
  meetingLink?: string | null;
}

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isEditLinkDialogOpen, setIsEditLinkDialogOpen] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Check doctor authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthChecking(true);
        // Check doctor session
        const response = await fetch("/api/auth/doctor-session", {
          credentials: 'include' // Include cookies in the request
        });
        const data = await response.json();
        
        if (data.doctor) {
          setIsAuthenticated(true);
        } else {
          // Not authenticated, redirect
          router.push("/auth/doctor-login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/auth/doctor-login");
      } finally {
        setAuthChecking(false);
      }
    };
    
    checkAuth();
  }, [router]);

  // Function to get meeting link from localStorage
  const getMeetingLinkFromStorage = (appointmentId: string): string | null => {
    if (typeof window === 'undefined') return null; // Server-side check
    
    try {
      const storageKey = `meetingLink_${appointmentId}`;
      const storedLink = localStorage.getItem(storageKey);
      console.log(`Retrieved link from localStorage for ${appointmentId}:`, storedLink);
      return storedLink;
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  };
  
  // Function to save meeting link to localStorage
  const saveMeetingLinkToStorage = (appointmentId: string, link: string): void => {
    if (typeof window === 'undefined') return; // Server-side check
    
    try {
      const storageKey = `meetingLink_${appointmentId}`;
      localStorage.setItem(storageKey, link);
      console.log(`Saved link to localStorage for ${appointmentId}:`, link);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Function to ensure all necessary fields exist in appointment objects
  const normalizeAppointment = (appointment: Appointment): Appointment => {
    const normalized = { ...appointment };
    
    // Ensure critical fields exist
    if (!('meetingLink' in normalized)) {
      console.log(`Adding missing meetingLink field to appointment ${normalized._id}`);
      normalized.meetingLink = null;
    }
    
    // Try to get meeting link from localStorage if it's null/empty in the database
    if (!normalized.meetingLink) {
      const storedLink = getMeetingLinkFromStorage(normalized._id);
      if (storedLink) {
        console.log(`Using localStorage meeting link for ${normalized._id}`);
        normalized.meetingLink = storedLink;
      }
    }
    
    if (!('rejectionReason' in normalized)) {
      normalized.rejectionReason = null;
    }
    
    // Ensure patient field exists and has required structure
    if (!normalized.patient) {
      console.log(`Adding missing or empty patient field to appointment ${normalized._id}`);
      normalized.patient = {
        _id: `unknown-patient-${Date.now()}`, // Generate a unique ID string instead of using mongoose
        name: `Unknown Patient`,
        email: `unknown@example.com`
      };
    }
    
    return normalized;
  };

  // Fetch appointments only after authentication is confirmed
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        setError("");
        
        const response = await fetch("/api/appointments?role=doctor", {
          credentials: 'include' // Include cookies in the request
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }
        
        const data = await response.json();
        console.log("Fetched appointments:", data.appointments);
        
        // Process appointments to ensure all fields exist
        const processedAppointments = data.appointments.map((app: Appointment) => normalizeAppointment(app));
        
        // Check for pending appointments specifically
        const pendingAppointments = processedAppointments.filter((a: Appointment) => a.status === "pending");
        console.log("Pending appointments:", pendingAppointments);
        
        // Check if patient data exists in pending appointments
        pendingAppointments.forEach((app: Appointment, index: number) => {
          console.log(`Appointment ${index} patient:`, app.patient);
        });
        
        // Check for approved appointments without meeting links
        const approvedWithoutLinks = processedAppointments.filter(
          (a: Appointment) => a.status === "approved" && (!a.meetingLink || a.meetingLink === '')
        );
        
        if (approvedWithoutLinks.length > 0) {
          console.log(`Found ${approvedWithoutLinks.length} approved appointments without meeting links:`, 
            approvedWithoutLinks.map((a: Appointment) => a._id));
          // Call the fix-links endpoint
          await fixMissingMeetingLinks();
        }
        
        setAppointments(processedAppointments);
      } catch (error: any) {
        console.error("Error fetching appointments:", error);
        setError(error.message || "Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };
    
    if (!authChecking && isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated, authChecking]);

  // Function to fix meeting links
  const fixMissingMeetingLinks = async () => {
    try {
      // Use a simple default meeting link
      const defaultLink = "https://example.com/meeting";
      
      const response = await fetch(`/api/appointments/fix-links?defaultLink=${encodeURIComponent(defaultLink)}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error("Failed to fix meeting links");
        return;
      }
      
      const data = await response.json();
      console.log("Fixed meeting links:", data);
      
      // Refresh appointments
      const refreshResponse = await fetch("/api/appointments?role=doctor", {
        credentials: 'include'
      });
      
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setAppointments(refreshData.appointments);
      }
    } catch (error) {
      console.error("Error fixing meeting links:", error);
    }
  };

  // Filter appointments based on active tab
  const filteredAppointments = appointments.filter(
    appointment => appointment.status === activeTab
  );

  // Debug appointments data
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && appointments.length > 0) {
      console.log('All appointments:', appointments);
      
      // Log approved appointments specifically
      const approved = appointments.filter(a => a.status === 'approved');
      console.log('Approved appointments:', approved);
      
      // Check for missing meeting links
      const missingLinks = approved.filter(a => !a.meetingLink);
      if (missingLinks.length > 0) {
        console.log('Approved appointments missing meeting links:', missingLinks);
      }
    }
  }, [appointments]);

  // Only log in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Filtered ${activeTab} appointments:`, filteredAppointments);
  }

  // Handle appointment approval
  const handleApprove = async () => {
    if (!selectedAppointment || !meetingLink) return;
    
    try {
      setIsSubmitting(true);
      console.log('Approving appointment with meeting link:', meetingLink);
      
      // Simple approach to ensure link has https:// prefix
      let formattedLink = meetingLink.trim();
      if (formattedLink && !formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
        formattedLink = 'https://' + formattedLink;
      }
      
      // Store the meeting link in localStorage immediately
      saveMeetingLinkToStorage(selectedAppointment._id, formattedLink);
      
      // Make sure the selected appointment is normalized before proceeding
      const normalizedAppointment = normalizeAppointment(selectedAppointment);
      
      const response = await fetch(`/api/appointments/${normalizedAppointment._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          status: "approved",
          meetingLink: formattedLink,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve appointment");
      }
      
      const responseData = await response.json();
      console.log('Approval response:', responseData);
      
      // Make sure to use the response data to update the local state
      if (responseData.appointment) {
        // Normalize the response appointment
        const normalizedResponseAppointment = normalizeAppointment(responseData.appointment);
        
        // Ensure the meeting link from localStorage is used if the API response doesn't include it
        if (!normalizedResponseAppointment.meetingLink) {
          normalizedResponseAppointment.meetingLink = formattedLink;
        }
        
        // Update local state using the normalized response data
        setAppointments(appointments.map(appointment => 
          appointment._id === normalizedAppointment._id 
            ? normalizedResponseAppointment
            : appointment
        ));
      } else {
        // Fallback to manual update if response doesn't include the appointment
        setAppointments(appointments.map(appointment => 
          appointment._id === normalizedAppointment._id 
            ? { 
                ...normalizeAppointment(appointment), 
                status: "approved", 
                meetingLink: formattedLink,
                rejectionReason: null
              } 
            : appointment
        ));
      }
      
      // Show success message
      alert("Appointment approved. The patient has been notified and provided with the meeting link.");
      
      setIsApproveDialogOpen(false);
      setMeetingLink("");
    } catch (error: any) {
      console.error("Error approving appointment:", error);
      alert(error.message || "Failed to approve appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle appointment rejection
  const handleReject = async () => {
    if (!selectedAppointment || !rejectionReason) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/appointments/${selectedAppointment._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({
          status: "rejected",
          rejectionReason,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reject appointment");
      }
      
      // Update local state
      setAppointments(appointments.map(appointment => 
        appointment._id === selectedAppointment._id 
          ? { ...appointment, status: "rejected", rejectionReason } 
          : appointment
      ));
      
      // Show success message without toast
      alert("Appointment rejected. The patient has been notified of your decision.");
      
      setIsRejectDialogOpen(false);
      setRejectionReason("");
    } catch (error: any) {
      console.error("Error rejecting appointment:", error);
      // Show error without toast
      alert(error.message || "Failed to reject appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle meeting link update for already approved appointments
  const handleUpdateMeetingLink = async () => {
    if (!selectedAppointment || !meetingLink) return;
    
    try {
      setIsSubmitting(true);
      console.log('Updating meeting link for approved appointment:', meetingLink);
      
      // Simple approach to ensure link has https:// prefix
      let formattedLink = meetingLink.trim();
      if (formattedLink && !formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
        formattedLink = 'https://' + formattedLink;
      }
      
      // Store the meeting link in localStorage immediately
      saveMeetingLinkToStorage(selectedAppointment._id, formattedLink);
      
      // Make sure the selected appointment is normalized before proceeding
      const normalizedAppointment = normalizeAppointment(selectedAppointment);
      
      const response = await fetch(`/api/appointments/${normalizedAppointment._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          status: "approved", // Always include status
          meetingLink: formattedLink,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update meeting link");
      }
      
      const responseData = await response.json();
      console.log('Update meeting link response:', responseData);
      
      // Make sure to use the response data to update the local state
      if (responseData.appointment) {
        // Normalize the response appointment
        const normalizedResponseAppointment = normalizeAppointment(responseData.appointment);
        
        // Ensure the meeting link from localStorage is used if the API response doesn't include it
        if (!normalizedResponseAppointment.meetingLink) {
          normalizedResponseAppointment.meetingLink = formattedLink;
        }
        
        // Update local state using the normalized response data
        setAppointments(appointments.map(appointment => 
          appointment._id === normalizedAppointment._id 
            ? normalizedResponseAppointment
            : appointment
        ));
      } else {
        // Fallback to manual update if response doesn't include the appointment
        setAppointments(appointments.map(appointment => 
          appointment._id === normalizedAppointment._id 
            ? { ...normalizeAppointment(appointment), meetingLink: formattedLink } 
            : appointment
        ));
      }
      
      // Show success message
      alert("Meeting link updated successfully. The patient has been notified of the new link.");
      
      setIsEditLinkDialogOpen(false);
      setMeetingLink("");
    } catch (error: any) {
      console.error("Error updating meeting link:", error);
      alert(error.message || "Failed to update meeting link");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state during auth check
  if (authChecking) {
    return (
      <DoctorLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Appointment Requests</h1>
          {process.env.NODE_ENV !== 'production' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fixMissingMeetingLinks}
              className="text-xs"
            >
              Fix Missing Links
            </Button>
          )}
        </div>

        {/* Remove debug info panel in production */}
        {process.env.NODE_ENV !== 'production' && (
          <pre className="text-xs bg-gray-50 p-2 mb-4 rounded">
            Debug: Total appointments: {appointments.length}, 
            Pending: {appointments.filter(a => a.status === "pending").length}, 
            Filtered: {filteredAppointments.length}
          </pre>
        )}

        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span>Pending</span>
              <Badge variant="secondary" className="ml-1">
                {appointments.filter(a => a.status === "pending").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>Approved</span>
              <Badge variant="secondary" className="ml-1">
                {appointments.filter(a => a.status === "approved").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <X className="h-4 w-4" />
              <span>Rejected</span>
              <Badge variant="secondary" className="ml-1">
                {appointments.filter(a => a.status === "rejected").length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <CalendarClock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="text-lg font-medium">No {activeTab} appointments</p>
              <p>All caught up!</p>
            </div>
          ) : (
            <TabsContent value={activeTab} className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <Card key={appointment._id} className="overflow-hidden">
                  {/* Only show debug info in development */}
                  {process.env.NODE_ENV !== 'production' && (
                    <div className="bg-gray-50 text-xs p-1 border-b">
                      ID: {appointment._id} | 
                      Status: {appointment.status} | 
                      Patient exists: {appointment.patient ? 'Yes' : 'No'}
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          {appointment.patient?.name || 
                            <span className="text-orange-500">Unknown Patient (ID: {
                              typeof appointment.patient === 'string' 
                                ? (appointment.patient as string).substring(0, 8) + '...' 
                                : appointment.patient?._id 
                                  ? appointment.patient._id.toString().substring(0, 8) + '...'
                                  : 'Missing'
                            })</span>
                          }
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          {appointment.patient?.email || 'No email available'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          appointment.status === "pending" ? "outline" :
                          appointment.status === "approved" ? "success" : "destructive"
                        }>
                          {appointment.status === "pending" ? "Pending" :
                           appointment.status === "approved" ? "Approved" : "Rejected"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {new Date(appointment.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{appointment.time}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Reason:</p>
                        <p className="text-sm">{appointment.reason}</p>
                      </div>
                    </div>
                    
                    {appointment.status === "approved" && (
                      <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Video className="h-4 w-4 text-green-600" />
                          <p className="text-sm font-medium text-green-800">Meeting Link:</p>
                        </div>
                        {/* Check both appointment.meetingLink and localStorage */}
                        {(() => {
                          // Get link from appointment or localStorage
                          const displayLink = appointment.meetingLink || getMeetingLinkFromStorage(appointment._id);
                          return displayLink ? (
                            <>
                              <a 
                                href={displayLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline break-all"
                              >
                                {displayLink}
                                {!appointment.meetingLink && (
                                  <span className="text-xs ml-1 text-gray-500">(from local storage)</span>
                                )}
                              </a>
                              <div className="mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setMeetingLink(displayLink);
                                    setIsEditLinkDialogOpen(true);
                                  }}
                                >
                                  Edit Link
                                </Button>
                              </div>
                            </>
                          ) : (
                            <div>
                              <p className="text-sm text-red-500 mb-2">
                                Meeting link missing. Please add a meeting link.
                                {process.env.NODE_ENV !== 'production' && (
                                  <span className="block text-xs mt-1">
                                    Debug: Missing meetingLink in {JSON.stringify({
                                      id: appointment._id, 
                                      hasField: 'meetingLink' in appointment,
                                      fieldValue: appointment.meetingLink,
                                      localStorage: getMeetingLinkFromStorage(appointment._id)
                                    })}
                                  </span>
                                )}
                              </p>
                              <Button
                                size="sm"
                                onClick={() => {
                                  // Normalize the appointment object before using it
                                  const normalizedAppointment = normalizeAppointment(appointment);
                                  setSelectedAppointment(normalizedAppointment);
                                  setMeetingLink('');
                                  setIsEditLinkDialogOpen(true);
                                }}
                              >
                                Add Meeting Link
                              </Button>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    
                    {appointment.status === "rejected" && (
                      <div className="mt-4 p-3 bg-red-50 rounded-md border border-red-200">
                        <p className="text-sm font-medium text-red-800">Reason for rejection:</p>
                        <p className="text-sm text-red-700">{appointment.rejectionReason}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 pt-4">
                    {appointment.status === "pending" && (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setIsRejectDialogOpen(true);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button 
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setIsApproveDialogOpen(true);
                          }}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Appointment</DialogTitle>
            <DialogDescription>
              Provide a meeting link for the patient. This will be sent to them upon approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="meetingLink" className="text-sm font-medium">
                Meeting Link <span className="text-red-500">*</span>
              </label>
              <Input
                id="meetingLink"
                placeholder="https://meet.google.com/abc-xyz-123"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Enter a Google Meet, Zoom, or any other video conferencing link. Make sure to include https:// at the beginning.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApprove} 
              disabled={!meetingLink || isSubmitting}
            >
              {isSubmitting ? 
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div> : 
                "Approve Appointment"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Appointment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this appointment request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="rejectionReason" className="text-sm font-medium">
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="rejectionReason"
                placeholder="I'm unavailable at the requested time..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject} 
              disabled={!rejectionReason || isSubmitting}
            >
              {isSubmitting ? 
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div> : 
                "Reject Appointment"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Meeting Link Dialog */}
      <Dialog open={isEditLinkDialogOpen} onOpenChange={setIsEditLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {meetingLink ? 'Edit Meeting Link' : 'Add Meeting Link'}
            </DialogTitle>
            <DialogDescription>
              {meetingLink 
                ? 'Update the meeting link for this appointment. The patient will be notified of the change.'
                : 'Provide a meeting link for the patient. This will be sent to them upon update.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="editMeetingLink" className="text-sm font-medium">
                Meeting Link <span className="text-red-500">*</span>
              </label>
              <Input
                id="editMeetingLink"
                placeholder="https://meet.google.com/abc-xyz-123"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Enter a Google Meet, Zoom, or any other video conferencing link. Make sure to include https:// at the beginning.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateMeetingLink} 
              disabled={!meetingLink || isSubmitting}
            >
              {isSubmitting ? 
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div> : 
                meetingLink ? "Update Meeting Link" : "Add Meeting Link"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DoctorLayout>
  );
} 