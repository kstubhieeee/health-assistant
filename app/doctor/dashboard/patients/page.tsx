"use client";

import { useState } from "react";
import { Search, Plus, Filter, MoreHorizontal, Download, User, Phone, Mail, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for patients
const patients = [
  {
    id: 1,
    name: "Alice Johnson",
    age: 32,
    gender: "Female",
    contactNumber: "+1 (555) 123-4567",
    email: "alice.johnson@example.com",
    lastVisit: "2023-10-15",
    nextAppointment: "2023-11-20",
    status: "Active",
    condition: "Hypertension",
  },
  {
    id: 2,
    name: "Bob Smith",
    age: 45,
    gender: "Male",
    contactNumber: "+1 (555) 987-6543",
    email: "bob.smith@example.com",
    lastVisit: "2023-09-28",
    nextAppointment: "2023-11-20",
    status: "Active",
    condition: "Diabetes",
  },
  {
    id: 3,
    name: "Carol Davis",
    age: 28,
    gender: "Female",
    contactNumber: "+1 (555) 456-7890",
    email: "carol.davis@example.com",
    lastVisit: "2023-10-30",
    nextAppointment: "2023-11-20",
    status: "Active",
    condition: "Asthma",
  },
  {
    id: 4,
    name: "David Wilson",
    age: 52,
    gender: "Male",
    contactNumber: "+1 (555) 789-0123",
    email: "david.wilson@example.com",
    lastVisit: "2023-10-05",
    nextAppointment: "2023-11-21",
    status: "Active",
    condition: "Arthritis",
  },
  {
    id: 5,
    name: "Emma Brown",
    age: 37,
    gender: "Female",
    contactNumber: "+1 (555) 234-5678",
    email: "emma.brown@example.com",
    lastVisit: "2023-10-22",
    nextAppointment: "2023-11-21",
    status: "Active",
    condition: "Migraine",
  },
];

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Patients</h1>
        <p className="text-muted-foreground">Manage your patient records</p>
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
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="table" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="cards">Card View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age/Gender</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Next Appointment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{patient.age} / {patient.gender}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs flex items-center">
                            <Phone className="h-3 w-3 mr-1" /> {patient.contactNumber}
                          </span>
                          <span className="text-xs flex items-center mt-1">
                            <Mail className="h-3 w-3 mr-1" /> {patient.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{patient.condition}</TableCell>
                      <TableCell>{patient.lastVisit}</TableCell>
                      <TableCell>{patient.nextAppointment}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Patient</DropdownMenuItem>
                            <DropdownMenuItem>Medical History</DropdownMenuItem>
                            <DropdownMenuItem>Schedule Appointment</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{patient.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Patient</DropdownMenuItem>
                      <DropdownMenuItem>Medical History</DropdownMenuItem>
                      <DropdownMenuItem>Schedule Appointment</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{patient.age} years • {patient.gender}</p>
                    <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200">
                      {patient.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    {patient.contactNumber}
                  </div>
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    {patient.email}
                  </div>
                  <div className="flex items-center">
                    <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />
                    Next: {patient.nextAppointment}
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t">
                  <p className="text-sm font-medium">Condition</p>
                  <p className="text-sm text-muted-foreground">{patient.condition}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
