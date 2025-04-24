"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Stethoscope, LogOut, User, Settings, Menu } from "lucide-react";

interface DoctorHeaderProps {
  doctorName?: string;
}

export default function DoctorHeader({ doctorName }: DoctorHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Initialize name only after component is mounted to prevent hydration mismatch
    setName(doctorName || "");
    
    // If no doctor name is provided, try to get it from localStorage
    if (!doctorName) {
      try {
        const storedDoctor = localStorage.getItem("doctor");
        if (storedDoctor) {
          const doctorData = JSON.parse(storedDoctor);
          setName(doctorData.fullName || "Doctor");
        }
      } catch (error) {
        console.error("Error loading doctor data:", error);
      }
    }
  }, [doctorName]);

  const handleLogout = async () => {
    try {
      // Call the logout API to clear the cookie
      const response = await fetch("/api/auth/doctor-logout", {
        method: "POST",
      });
      
      if (!response.ok) {
        console.error("Failed to logout properly");
      }
      
      // Clear localStorage data
      localStorage.removeItem("doctor");
      
      // Redirect to login page
      window.location.href = "/doctor";
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect even if there's an error
      window.location.href = "/doctor";
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "DR";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Display a placeholder during server-side rendering and initial client-side render
  // to prevent hydration mismatch
  const displayName = mounted ? name : "";
  const initials = mounted ? getInitials(name) : "DR";

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 ml-4">
          <Stethoscope className="h-6 w-6 text-primary" />
          <Link href="/doctor/dashboard" className="text-xl font-semibold">
            Doctor Portal
          </Link>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 w-10 rounded-full p-0" aria-label="Doctor menu">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">Doctor</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/doctor/dashboard" className="cursor-pointer flex w-full items-center">
                <User className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/doctor/profile" className="cursor-pointer flex w-full items-center">
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
} 