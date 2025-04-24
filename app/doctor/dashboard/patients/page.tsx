"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  ClipboardList, 
  Calendar, 
  UserRound, 
  HeartPulse,
  Loader2
} from "lucide-react";
import { DateDisplay } from "@/components/date-display";

// Sample patient data
const samplePatients = [
  {
    id: "P001",
    name: "John Doe",
    age: 45,
    gender: "Male",
    conditions: ["Hypertension", "Diabetes"],
    lastVisit: new Date("2023-05-15"),
    nextAppointment: new Date("2023-07-10"),
  },
  {
    id: "P002",
    name: "Jane Smith",
    age: 32,
    gender: "Female",
    conditions: ["Asthma"],
    lastVisit: new Date("2023-06-02"),
    nextAppointment: new Date("2023-06-30"),
  },
  {
    id: "P003",
    name: "Robert Johnson",
    age: 68,
    gender: "Male",
    conditions: ["Arthritis", "Heart Disease"],
    lastVisit: new Date("2023-06-10"),
    nextAppointment: null,
  },
  {
    id: "P004",
    name: "Emily Davis",
    age: 28,
    gender: "Female",
    conditions: [],
    lastVisit: new Date("2023-05-20"),
    nextAppointment: new Date("2023-07-05"),
  },
];

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  conditions: string[];
  lastVisit: Date;
  nextAppointment: Date | null;
}

export default function PatientsPage() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Authentication and data loading
  useEffect(() => {
    // Check if the user is logged in and is a doctor
    const checkAuth = async () => {
      try {
        // Simulate fetching doctor data
        setTimeout(() => {
          setDoctor({
            id: "D001",
            name: "Dr. Sarah Wilson",
            specialty: "Family Medicine"
          });
          setPatients(samplePatients);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Authentication error:", error);
        router.push("/sign-in");
      }
    };

    checkAuth();
  }, [router]);

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p>Loading patient data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patient Management</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredPatients.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="overflow-hidden">
              <CardHeader className="bg-muted pb-2">
                <CardTitle className="text-lg flex justify-between">
                  <span>{patient.name}</span>
                  <span className="text-sm font-normal text-muted-foreground">{patient.id}</span>
                </CardTitle>
                <div className="flex text-sm text-muted-foreground space-x-4">
                  <span className="flex items-center">
                    <UserRound className="mr-1 h-4 w-4" />
                    {patient.age}, {patient.gender}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-3">
                  <div className="font-medium flex items-center mb-1">
                    <HeartPulse className="mr-1 h-4 w-4 text-red-500" />
                    Health Conditions
                  </div>
                  <div className="text-sm">
                    {patient.conditions.length > 0
                      ? patient.conditions.join(", ")
                      : "No chronic conditions"}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div>
                    <div className="font-medium flex items-center">
                      <Calendar className="mr-1 h-4 w-4 text-blue-500" />
                      Last Visit
                    </div>
                    <DateDisplay date={patient.lastVisit} format="MMM d, yyyy" />
                  </div>
                  <div>
                    <div className="font-medium flex items-center">
                      <Calendar className="mr-1 h-4 w-4 text-green-500" />
                      Next Appointment
                    </div>
                    {patient.nextAppointment ? (
                      <DateDisplay date={patient.nextAppointment} format="MMM d, yyyy" />
                    ) : (
                      <span className="text-muted-foreground">Not scheduled</span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/doctor/patients/${patient.id}/records`)}
                  >
                    <ClipboardList className="mr-1 h-4 w-4" />
                    View Records
                  </Button>
                  <Button 
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/doctor/appointments/schedule?patient=${patient.id}`)}
                  >
                    <Calendar className="mr-1 h-4 w-4" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : searchTerm ? (
        <div className="text-center p-8">
          <p className="text-muted-foreground">No patients match your search criteria.</p>
        </div>
      ) : (
        <div className="text-center p-8">
          <p className="text-muted-foreground">No patients available. Add your first patient to get started.</p>
          <Button className="mt-4">Add New Patient</Button>
        </div>
      )}
    </div>
  );
} 