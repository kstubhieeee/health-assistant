"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  UserCheck,
  Shield,
  LogOut
} from "lucide-react";

interface DoctorData {
  id: string;
  fullName: string;
  email: string;
  specialization: string;
  institution: string;
  credentials: string;
  medicalLicense: string;
  isVerified: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/doctors");
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch doctors");
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

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/admin-logout", {
        method: "POST",
      });
      router.push("/admin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/doctors/${id}/verify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isVerified: true }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to approve doctor");
      }

      // Refresh the doctor list
      fetchDoctors();
    } catch (error: any) {
      console.error("Error approving doctor:", error);
      alert(`Error: ${error.message || "Failed to approve doctor"}`);
    }
  };

  const handleReject = async (id: string) => {
    // In a real app, you might want to add a reason for rejection
    const reason = prompt("Enter reason for rejection (optional):");
    
    try {
      const response = await fetch(`/api/admin/doctors/${id}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          isVerified: false,
          rejectionReason: reason || "Application rejected by admin" 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reject doctor");
      }

      // Refresh the doctor list
      fetchDoctors();
    } catch (error: any) {
      console.error("Error rejecting doctor:", error);
      alert(`Error: ${error.message || "Failed to reject doctor"}`);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doctor.specialization && doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filter === "all") return matchesSearch;
    if (filter === "pending") return matchesSearch && !doctor.isVerified;
    if (filter === "approved") return matchesSearch && doctor.isVerified;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="mb-6 text-muted-foreground">{error}</p>
          <Button onClick={() => fetchDoctors()}>Retry</Button>
        </Card>
      </div>
    );
  }

  const pendingCount = doctors.filter(doctor => !doctor.isVerified).length;
  const approvedCount = doctors.filter(doctor => doctor.isVerified).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <Badge variant="outline" className="mb-2">Admin Panel</Badge>
            <h1 className="text-3xl font-bold">Doctor Account Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review and approve healthcare professional account requests
            </p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="mt-4 md:mt-0"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3 mb-8">
          <Card className="p-4 flex items-center gap-3">
            <div className="bg-blue-100 text-blue-800 p-3 rounded-full">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
          </Card>
          
          <Card className="p-4 flex items-center gap-3">
            <div className="bg-green-100 text-green-800 p-3 rounded-full">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold">{approvedCount}</p>
            </div>
          </Card>
          
          <Card className="p-4 flex items-center gap-3">
            <div className="bg-purple-100 text-purple-800 p-3 rounded-full">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{doctors.length}</p>
            </div>
          </Card>
        </div>
        
        <Card className="mb-8">
          <div className="p-4 border-b flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search doctors..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant={filter === "all" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button 
                variant={filter === "pending" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilter("pending")}
              >
                <Clock className="h-4 w-4 mr-1" />
                Pending
              </Button>
              <Button 
                variant={filter === "approved" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilter("approved")}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Approved
              </Button>
            </div>
          </div>
          
          <div className="divide-y">
            {filteredDoctors.length === 0 ? (
              <div className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-medium text-lg">No doctors found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              filteredDoctors.map(doctor => (
                <div key={doctor.id} className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{doctor.fullName}</h3>
                        {!doctor.isVerified && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Pending</Badge>
                        )}
                        {doctor.isVerified && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{doctor.email}</p>
                      
                      <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm">
                        <div>
                          <span className="font-medium">License:</span> {doctor.medicalLicense}
                        </div>
                        <div>
                          <span className="font-medium">Specialization:</span> {doctor.specialization || "Not specified"}
                        </div>
                        <div>
                          <span className="font-medium">Institution:</span> {doctor.institution || "Not specified"}
                        </div>
                        <div>
                          <span className="font-medium">Credentials:</span> {doctor.credentials || "Not specified"}
                        </div>
                        <div>
                          <span className="font-medium">Registered:</span> {new Date(doctor.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    {!doctor.isVerified && (
                      <div className="flex gap-2 self-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleReject(doctor.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button 
                          size="sm"
                          className="text-white bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(doctor.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    )}
                    
                    {doctor.isVerified && (
                      <div className="self-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReject(doctor.id)}
                        >
                          Revoke Approval
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 