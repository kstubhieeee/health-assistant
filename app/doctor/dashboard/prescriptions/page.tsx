"use client";

import { useState } from "react";
import { Search, Plus, Filter, MoreHorizontal, Calendar, Download, User, Pill, RefreshCw, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for prescriptions
const prescriptions = [
  {
    id: 1,
    patientName: "Alice Johnson",
    patientAge: 32,
    medication: "Amoxicillin",
    dosage: "500mg",
    frequency: "3 times daily",
    startDate: "2023-11-15",
    duration: "7 days",
    status: "Active",
    refills: 0,
    notes: "Take with food",
  },
  {
    id: 2,
    patientName: "Bob Smith",
    patientAge: 45,
    medication: "Metformin",
    dosage: "1000mg",
    frequency: "Twice daily",
    startDate: "2023-11-10",
    duration: "30 days",
    status: "Active",
    refills: 2,
    notes: "Take with meals",
  },
  {
    id: 3,
    patientName: "Carol Davis",
    patientAge: 28,
    medication: "Albuterol",
    dosage: "90mcg",
    frequency: "As needed",
    startDate: "2023-11-05",
    duration: "30 days",
    status: "Active",
    refills: 1,
    notes: "Use for asthma symptoms",
  },
  {
    id: 4,
    patientName: "David Wilson",
    patientAge: 52,
    medication: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    startDate: "2023-10-20",
    duration: "30 days",
    status: "Expired",
    refills: 0,
    notes: "Take in the morning",
  },
  {
    id: 5,
    patientName: "Emma Brown",
    patientAge: 37,
    medication: "Sumatriptan",
    dosage: "50mg",
    frequency: "As needed",
    startDate: "2023-10-15",
    duration: "30 days",
    status: "Expired",
    refills: 0,
    notes: "Use at onset of migraine",
  },
];

export default function PrescriptionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = 
      prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medication.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || prescription.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Function to calculate end date based on start date and duration
  const calculateEndDate = (startDate: string, duration: string) => {
    const date = new Date(startDate);
    const durationMatch = duration.match(/(\d+)/);
    if (durationMatch) {
      const days = parseInt(durationMatch[0], 10);
      date.setDate(date.getDate() + days);
      return date.toISOString().split('T')[0];
    }
    return "N/A";
  };

  // Function to get appropriate badge color based on status
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "expired":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "refill requested":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Prescriptions</h1>
        <p className="text-muted-foreground">Manage your patient prescriptions</p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search prescriptions..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="refill requested">Refill Requested</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Prescription
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
                    <TableHead>Patient</TableHead>
                    <TableHead>Medication</TableHead>
                    <TableHead>Dosage / Frequency</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Refills</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrescriptions.map((prescription) => (
                    <TableRow key={prescription.id}>
                      <TableCell className="font-medium">
                        {prescription.patientName}
                        <div className="text-xs text-muted-foreground">Age: {prescription.patientAge}</div>
                      </TableCell>
                      <TableCell>{prescription.medication}</TableCell>
                      <TableCell>
                        <div>{prescription.dosage}</div>
                        <div className="text-xs text-muted-foreground">{prescription.frequency}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-xs">
                          <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                          {prescription.startDate} to {calculateEndDate(prescription.startDate, prescription.duration)}
                        </div>
                        <div className="text-xs text-muted-foreground">Duration: {prescription.duration}</div>
                      </TableCell>
                      <TableCell>{prescription.refills}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(prescription.status)}>
                          {prescription.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Prescription</DropdownMenuItem>
                            <DropdownMenuItem>Renew Prescription</DropdownMenuItem>
                            <DropdownMenuItem>Cancel Prescription</DropdownMenuItem>
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
          {filteredPrescriptions.map((prescription) => (
            <Card key={prescription.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{prescription.medication}</CardTitle>
                    <p className="text-sm text-muted-foreground">{prescription.dosage}, {prescription.frequency}</p>
                  </div>
                  <Badge className={getStatusBadgeClass(prescription.status)}>
                    {prescription.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Pill className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{prescription.patientName}</p>
                    <p className="text-xs text-muted-foreground">Age: {prescription.patientAge}</p>
                  </div>
                </div>
                
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      Start: {prescription.startDate}
                    </div>
                    <div>Duration: {prescription.duration}</div>
                  </div>
                  
                  <div className="flex items-center">
                    <RefreshCw className="mr-2 h-4 w-4 text-muted-foreground" />
                    Refills: {prescription.refills}
                  </div>
                  
                  {prescription.notes && (
                    <div className="flex items-start mt-1">
                      <div className="mr-2 mt-1">
                        <Check className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Instructions:</p>
                        <p className="text-xs text-muted-foreground">{prescription.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end mt-4 gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button size="sm">Renew</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
} 