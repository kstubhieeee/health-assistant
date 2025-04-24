"use client";

import { useState } from "react";
import { Search, Plus, Filter, MoreHorizontal, Download, User, FileText, Calendar, ExternalLink, FilePlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for medical records
const records = [
  {
    id: 1,
    patientName: "Alice Johnson",
    patientAge: 32,
    recordType: "Laboratory Results",
    date: "2023-11-15",
    description: "Complete Blood Count (CBC)",
    doctor: "Dr. Michael Chen",
    status: "Normal",
    files: [
      { name: "CBC_Results.pdf", size: "1.2MB" },
      { name: "Blood_Chemistry.pdf", size: "0.8MB" },
    ],
  },
  {
    id: 2,
    patientName: "Bob Smith",
    patientAge: 45,
    recordType: "Radiology Report",
    date: "2023-11-10",
    description: "Chest X-Ray",
    doctor: "Dr. Sarah Miller",
    status: "Abnormal - Follow-up Required",
    files: [
      { name: "Chest_XRay.jpg", size: "5.7MB" },
      { name: "Radiology_Report.pdf", size: "0.5MB" },
    ],
  },
  {
    id: 3,
    patientName: "Carol Davis",
    patientAge: 28,
    recordType: "Visit Note",
    date: "2023-11-05",
    description: "Annual Physical Examination",
    doctor: "Dr. James Wilson",
    status: "Completed",
    files: [
      { name: "Visit_Summary.pdf", size: "0.3MB" },
    ],
  },
  {
    id: 4,
    patientName: "David Wilson",
    patientAge: 52,
    recordType: "Specialist Referral",
    date: "2023-10-28",
    description: "Cardiology Consultation",
    doctor: "Dr. Emily Johnson",
    status: "Pending",
    files: [
      { name: "Referral_Form.pdf", size: "0.2MB" },
      { name: "Cardiovascular_History.pdf", size: "1.5MB" },
    ],
  },
  {
    id: 5,
    patientName: "Emma Brown",
    patientAge: 37,
    recordType: "Medication History",
    date: "2023-10-22",
    description: "Current Medications Review",
    doctor: "Dr. Michael Chen",
    status: "Updated",
    files: [
      { name: "Medication_List.pdf", size: "0.4MB" },
      { name: "Prescription_History.pdf", size: "0.9MB" },
    ],
  },
];

export default function MedicalRecordsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [recordTypeFilter, setRecordTypeFilter] = useState("all");
  
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = recordTypeFilter === "all" || record.recordType.toLowerCase() === recordTypeFilter.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  // Function to get status color
  const getStatusColor = (status: string) => {
    if (status.toLowerCase().includes("normal") || status.toLowerCase() === "completed" || status.toLowerCase() === "updated") {
      return "text-green-600";
    } else if (status.toLowerCase().includes("abnormal")) {
      return "text-red-600";
    } else if (status.toLowerCase() === "pending") {
      return "text-amber-600";
    }
    return "text-gray-600";
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Medical Records</h1>
        <p className="text-muted-foreground">Access and manage patient medical records</p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search records..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={recordTypeFilter} onValueChange={setRecordTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Record Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="laboratory results">Laboratory Results</SelectItem>
              <SelectItem value="radiology report">Radiology Reports</SelectItem>
              <SelectItem value="visit note">Visit Notes</SelectItem>
              <SelectItem value="specialist referral">Specialist Referrals</SelectItem>
              <SelectItem value="medication history">Medication History</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Button>
            <FilePlus className="mr-2 h-4 w-4" />
            Add Record
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Records</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="labs">Lab Results</TabsTrigger>
          <TabsTrigger value="imaging">Imaging</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {filteredRecords.map((record) => (
            <Card key={record.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{record.patientName}</h3>
                      <p className="text-sm text-muted-foreground">Age: {record.patientAge}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div>
                      <p className="font-medium">{record.recordType}</p>
                      <p className="text-sm text-muted-foreground">{record.description}</p>
                    </div>
                    
                    <div className="hidden md:block">
                      <p className="text-sm flex items-center">
                        <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                        {record.date}
                      </p>
                      <p className="text-sm text-muted-foreground">{record.doctor}</p>
                    </div>
                    
                    <div>
                      <p className={`font-medium ${getStatusColor(record.status)}`}>{record.status}</p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Record</DropdownMenuItem>
                        <DropdownMenuItem>Edit Record</DropdownMenuItem>
                        <DropdownMenuItem>Download All Files</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Share with Patient</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Attached Files:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {record.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">({file.size})</span>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="recent" className="space-y-4">
          {filteredRecords
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3)
            .map((record) => (
              <Card key={record.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{record.patientName}</h3>
                        <p className="text-sm text-muted-foreground">Age: {record.patientAge}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div>
                        <p className="font-medium">{record.recordType}</p>
                        <p className="text-sm text-muted-foreground">{record.description}</p>
                      </div>
                      
                      <div className="hidden md:block">
                        <p className="text-sm flex items-center">
                          <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                          {record.date}
                        </p>
                        <p className="text-sm text-muted-foreground">{record.doctor}</p>
                      </div>
                      
                      <div>
                        <p className={`font-medium ${getStatusColor(record.status)}`}>{record.status}</p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Record</DropdownMenuItem>
                          <DropdownMenuItem>Edit Record</DropdownMenuItem>
                          <DropdownMenuItem>Download All Files</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Share with Patient</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Attached Files:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {record.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">({file.size})</span>
                          </div>
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
        
        <TabsContent value="labs" className="space-y-4">
          {filteredRecords
            .filter(record => record.recordType.toLowerCase() === "laboratory results")
            .map((record) => (
              <Card key={record.id} className="overflow-hidden">
                <CardContent className="p-6">
                  {/* Same content structure as "all" tab */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{record.patientName}</h3>
                        <p className="text-sm text-muted-foreground">Age: {record.patientAge}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div>
                        <p className="font-medium">{record.recordType}</p>
                        <p className="text-sm text-muted-foreground">{record.description}</p>
                      </div>
                      
                      <div className="hidden md:block">
                        <p className="text-sm flex items-center">
                          <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                          {record.date}
                        </p>
                        <p className="text-sm text-muted-foreground">{record.doctor}</p>
                      </div>
                      
                      <div>
                        <p className={`font-medium ${getStatusColor(record.status)}`}>{record.status}</p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Record</DropdownMenuItem>
                          <DropdownMenuItem>Edit Record</DropdownMenuItem>
                          <DropdownMenuItem>Download All Files</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Share with Patient</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Attached Files:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {record.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">({file.size})</span>
                          </div>
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
        
        <TabsContent value="imaging" className="space-y-4">
          {filteredRecords
            .filter(record => record.recordType.toLowerCase().includes("radiology"))
            .map((record) => (
              <Card key={record.id} className="overflow-hidden">
                <CardContent className="p-6">
                  {/* Same content structure as "all" tab */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{record.patientName}</h3>
                        <p className="text-sm text-muted-foreground">Age: {record.patientAge}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div>
                        <p className="font-medium">{record.recordType}</p>
                        <p className="text-sm text-muted-foreground">{record.description}</p>
                      </div>
                      
                      <div className="hidden md:block">
                        <p className="text-sm flex items-center">
                          <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                          {record.date}
                        </p>
                        <p className="text-sm text-muted-foreground">{record.doctor}</p>
                      </div>
                      
                      <div>
                        <p className={`font-medium ${getStatusColor(record.status)}`}>{record.status}</p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Record</DropdownMenuItem>
                          <DropdownMenuItem>Edit Record</DropdownMenuItem>
                          <DropdownMenuItem>Download All Files</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Share with Patient</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Attached Files:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {record.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">({file.size})</span>
                          </div>
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
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