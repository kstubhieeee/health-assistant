"use client";

import { useState } from "react";
import { Calendar, Clock, User, MapPin, MoreHorizontal, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for appointments
const appointments = [
  {
    id: 1,
    patientName: "Alice Johnson",
    patientAge: 32,
    date: "2023-11-20",
    time: "10:00 AM",
    type: "Check-up",
    status: "upcoming",
    location: "Main Clinic",
  },
  {
    id: 2,
    patientName: "Bob Smith",
    patientAge: 45,
    date: "2023-11-20",
    time: "11:30 AM",
    type: "Follow-up",
    status: "upcoming",
    location: "Main Clinic",
  },
  {
    id: 3,
    patientName: "Carol Davis",
    patientAge: 28,
    date: "2023-11-20",
    time: "2:00 PM",
    type: "Consultation",
    status: "upcoming",
    location: "Virtual",
  },
  {
    id: 4,
    patientName: "David Wilson",
    patientAge: 52,
    date: "2023-11-21",
    time: "9:30 AM",
    type: "Check-up",
    status: "upcoming",
    location: "Main Clinic",
  },
  {
    id: 5,
    patientName: "Emma Brown",
    patientAge: 37,
    date: "2023-11-21",
    time: "3:15 PM",
    type: "Follow-up",
    status: "upcoming",
    location: "East Wing",
  },
];

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <p className="text-muted-foreground">Manage your upcoming patient appointments</p>
      </div>
      
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Appointments</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
          
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{appointment.patientName}</h3>
                      <p className="text-sm text-muted-foreground">Age: {appointment.patientAge}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                        {appointment.date}
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                        {appointment.time}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start">
                      <Badge variant="outline">{appointment.type}</Badge>
                      <div className="flex items-center text-sm mt-1">
                        <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
                        {appointment.location}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Appointment</DropdownMenuItem>
                        <DropdownMenuItem>Cancel Appointment</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>Manage appointments in calendar format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-10 text-center text-muted-foreground">
                Calendar view will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
