"use client";

import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { MailIcon, LogOutIcon, UserIcon } from "lucide-react";
import Link from "next/link";

interface DoctorData {
  id: string;
  fullName: string;
  email: string;
  specialization?: string;
  institution?: string;
}

export function ProfileDropdown() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [doctor, setDoctor] = useState<DoctorData | null>(null);

  useEffect(() => {
    // Check if we have doctor data in localStorage
    if (typeof window !== 'undefined') {
      const storedDoctor = localStorage.getItem("doctor");
      if (storedDoctor) {
        try {
          const parsedDoctor = JSON.parse(storedDoctor);
          setDoctor(parsedDoctor);
        } catch (error) {
          console.error("Error parsing stored doctor data:", error);
        }
      }
    }
  }, []);

  const handleDoctorLogout = async () => {
    try {
      const response = await fetch("/api/auth/doctor-logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      // Clear doctor data from localStorage
      localStorage.removeItem("doctor");
      
      // Redirect to doctor login page
      window.location.href = "/doctor";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const dropdown = document.getElementById('profile-dropdown');
      if (dropdown && !dropdown.contains(target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // If no user or doctor is logged in, return null
  if (!session?.user && !doctor) return null;

  // Doctor is logged in
  if (doctor) {
    return (
      <div className="relative" id="profile-dropdown">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 focus:outline-none"
        >
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">
              {doctor.fullName}
            </span>
            <span className="text-xs text-muted-foreground">
              Doctor
            </span>
          </div>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-background rounded-md shadow-lg py-1 z-50 border">
            <div className="px-4 py-2 border-b">
              <p className="text-sm font-medium">{doctor.fullName}</p>
              <p className="text-xs text-muted-foreground flex items-center">
                <MailIcon className="h-3 w-3 mr-1" /> 
                {doctor.email}
              </p>
              {doctor.specialization && (
                <p className="text-xs text-muted-foreground mt-1">
                  {doctor.specialization}
                </p>
              )}
            </div>
            <Link 
              href="/doctor/dashboard" 
              className="block px-4 py-2 text-sm hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <button
              onClick={handleDoctorLogout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-accent flex items-center"
            >
              <LogOutIcon className="h-4 w-4 mr-2" />
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  }

  // At this point we know session?.user must exist since we checked !session?.user && !doctor above
  // Regular user is logged in
  return (
    <div className="relative" id="profile-dropdown">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "Profile"}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium">
              {session?.user?.name?.[0] || "U"}
            </span>
          </div>
        )}
        <span className="text-sm font-medium">
          {session?.user?.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-background rounded-md shadow-lg py-1 z-50 border">
          <div className="px-4 py-2 text-sm border-b">
            <p className="font-medium">{session?.user?.name}</p>
            <p className="text-xs text-muted-foreground flex items-center">
              <MailIcon className="h-3 w-3 mr-1" /> 
              {session?.user?.email}
            </p>
          </div>
          <Link 
            href="/dashboard" 
            className="block px-4 py-2 text-sm hover:bg-accent"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <button
            onClick={() => signOut()}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-accent flex items-center"
          >
            <LogOutIcon className="h-4 w-4 mr-2" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
} 