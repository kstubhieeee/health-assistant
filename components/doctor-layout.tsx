"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  CalendarDays, 
  ClipboardList, 
  Home,
  MessageSquare,
  Settings
} from "lucide-react";

// Doctor navigation items
export const doctorNavigationItems = [
  {
    title: "Dashboard",
    href: "/doctor/dashboard",
    icon: Home,
  },
  {
    title: "Patients",
    href: "/doctor/dashboard/patients",
    icon: Users,
  },
  {
    title: "Appointments",
    href: "/doctor/dashboard/appointments",
    icon: CalendarDays,
  },
  {
    title: "Medical Records",
    href: "/doctor/dashboard/records",
    icon: ClipboardList,
  },
  {
    title: "Messages",
    href: "/doctor/dashboard/messages",
    icon: MessageSquare,
  },
  {
    title: "Settings",
    href: "/doctor/dashboard/settings",
    icon: Settings,
  },
];

interface DoctorLayoutProps {
  children: React.ReactNode;
}

export default function DoctorLayout({ children }: DoctorLayoutProps) {
  // Using static sidebar with no dynamic elements that could cause hydration mismatches
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden border-r bg-background lg:block lg:w-64">
        <div className="flex h-full flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/doctor/dashboard" className="flex items-center font-semibold">
              <span className="text-primary">Doctor Portal</span>
            </Link>
          </div>
          
          <ScrollArea className="flex-1 px-2 py-4">
            <nav className="flex flex-col gap-1">
              {doctorNavigationItems.map((item) => (
                <Button
                  key={item.href}
                  // Use ghost for all items on initial render to avoid hydration mismatch
                  variant="ghost"
                  className="justify-start"
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              ))}
            </nav>
          </ScrollArea>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {children}
      </div>
    </div>
  );
} 