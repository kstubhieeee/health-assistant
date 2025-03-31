"use client";

import { Leaf } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProfileDropdown } from "./profile-dropdown";

export function Navbar() {
  return (
    <nav className="border-b bg-background/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <Leaf className="h-6 w-6 text-primary" />
          <span>Health AI Assistant</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium">
            Home
          </Link>
          <Link href="#features" className="text-sm font-medium">
            Features
          </Link>
          <Link href="/check">
            <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
              Get Started
            </Badge>
          </Link>
          <ProfileDropdown />
        </div>
      </div>
    </nav>
  );
} 