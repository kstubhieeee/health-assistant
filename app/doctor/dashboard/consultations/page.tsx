"use client";

import { useState } from "react";
import { Search, Filter, MoreHorizontal, Clock, Calendar, User, VideoIcon, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// Mock data for consultations
const consultations = [
  {
    id: 1,
    patientName: "Alice Johnson",
    patientAge: 32,
    date: "2023-11-18",
    time: "10:00 AM",
    duration: "30 min",
    type: "Video Call",
    status: "Completed",
    notes: "Patient reported headaches and dizziness. Prescribed medication and recommended rest.",
    followUp: "2 weeks",
  },
  {
    id: 2,
    patientName: "Bob Smith",
    patientAge: 45,
    date: "2023-11-19",
    time: "11:30 AM",
    duration: "45 min",
    type: "In-person",
    status: "Completed",
    notes: "Follow-up for diabetes management. Blood sugar levels are stable.",
    followUp: "3 months",
  },
  {
    id: 3,
    patientName: "Carol Davis",
    patientAge: 28,
    date: "2023-11-20",
    time: "2:00 PM",
    duration: "30 min",
    type: "Phone Call",
    status: "Scheduled",
    notes: "",
    followUp: "",
  },
  {
    id: 4,
    patientName: "David Wilson",
    patientAge: 52,
    date: "2023-11-21",
    time: "9:30 AM",
    duration: "60 min",
    type: "In-person",
    status: "Scheduled",
    notes: "",
    followUp: "",
  },
  {
    id: 5,
    patientName: "Emma Brown",
    patientAge: 37,
    date: "2023-11-22",
    time: "3:15 PM",
    duration: "30 min",
    type: "Video Call",
    status: "Scheduled",
    notes: "",
    followUp: "",
  },
];

export default function ConsultationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = consultation.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || consultation.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === "all" || consultation.type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesType;
  });

  // Function to get appropriate icon based on consultation type
  const getConsultationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "video call":
        return <VideoIcon className="h-4 w-4" />;
      case "phone call":
        return <Phone className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  // Function to get appropriate badge color based on status
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "scheduled":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Consultations</h1>
        <p className="text-muted-foreground">Manage your patient consultations</p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
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
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="in-person">In-person</SelectItem>
              <SelectItem value="video call">Video Call</SelectItem>
              <SelectItem value="phone call">Phone Call</SelectItem>
            </SelectContent>
          </Select>
          
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            New Consultation
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past Consultations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {filteredConsultations
            .filter(c => c.status.toLowerCase() === "scheduled")
            .map((consultation) => (
              <Card key={consultation.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-6">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        {getConsultationIcon(consultation.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{consultation.patientName}</h3>
                        <p className="text-sm text-muted-foreground">Age: {consultation.patientAge}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-8">
                      <div className="flex flex-col items-start">
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                          {consultation.date}
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                          {consultation.time} ({consultation.duration})
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-start">
                        <Badge className={getStatusBadgeClass(consultation.status)}>
                          {consultation.status}
                        </Badge>
                        <Badge variant="outline" className="mt-1">
                          {consultation.type}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Start
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Reschedule</DropdownMenuItem>
                            <DropdownMenuItem>Cancel</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {filteredConsultations
            .filter(c => c.status.toLowerCase() === "completed")
            .map((consultation) => (
              <Card key={consultation.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-6">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        {getConsultationIcon(consultation.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{consultation.patientName}</h3>
                        <p className="text-sm text-muted-foreground">Age: {consultation.patientAge}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-8">
                      <div className="flex flex-col items-start">
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                          {consultation.date}
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                          {consultation.time} ({consultation.duration})
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-start">
                        <Badge className={getStatusBadgeClass(consultation.status)}>
                          {consultation.status}
                        </Badge>
                        <Badge variant="outline" className="mt-1">
                          {consultation.type}
                        </Badge>
                      </div>
                      
                      {consultation.notes && (
                        <div className="max-w-xs">
                          <p className="text-sm font-medium">Notes:</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{consultation.notes}</p>
                        </div>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Notes</DropdownMenuItem>
                          <DropdownMenuItem>Schedule Follow-up</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
} 