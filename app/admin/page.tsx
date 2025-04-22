"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Lock,
  Search,
  ShieldAlert
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Mock pending doctor registrations
const MOCK_DOCTORS = [
  {
    id: "d1",
    fullName: "Dr. Jane Smith",
    email: "jane.smith@hospital.com",
    medicalLicense: "ML12345678",
    specialization: "Cardiology",
    institution: "City General Hospital",
    credentials: "MD, FACC",
    status: "pending",
    registeredAt: "2023-04-15T10:30:00Z"
  },
  {
    id: "d2",
    fullName: "Dr. Michael Chen",
    email: "michael.chen@clinic.org",
    medicalLicense: "ML87654321",
    specialization: "Neurology",
    institution: "University Medical Center",
    credentials: "MD, PhD",
    status: "pending",
    registeredAt: "2023-04-16T14:45:00Z"
  },
  {
    id: "d3",
    fullName: "Dr. Sarah Johnson",
    email: "sarah.johnson@healthcare.net",
    medicalLicense: "ML55566677",
    specialization: "Pediatrics",
    institution: "Children's Medical Group",
    credentials: "MD, FAAP",
    status: "approved",
    registeredAt: "2023-04-10T09:15:00Z",
    approvedAt: "2023-04-12T11:30:00Z"
  },
  {
    id: "d4",
    fullName: "Dr. Robert Williams",
    email: "robert.williams@medcenter.com",
    medicalLicense: "ML11223344",
    specialization: "Orthopedics",
    institution: "Sports Medicine Center",
    credentials: "MD, FAAOS",
    status: "rejected",
    registeredAt: "2023-04-08T16:20:00Z",
    rejectedAt: "2023-04-11T13:45:00Z",
    rejectionReason: "License verification failed"
  }
];

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Redirect to admin dashboard on success
      router.push("/admin/dashboard");
    } catch (error: any) {
      setError(error.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center gap-2 mb-6">
          <ShieldAlert className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Admin Access</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground text-center">
          Admin access is restricted to authorized personnel only.
        </p>
      </Card>
    </div>
  );
} 