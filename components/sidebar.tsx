import {
  Activity,
  BarChart3,
  Calendar,
  ClipboardCheck,
  Clock,
  CreditCard,
  LayoutDashboard,
  Search,
  Settings,
  User,
  Scale
} from "lucide-react";

export const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Appointments",
    href: "/appointments",
    icon: Calendar,
  },
  {
    title: "Medical Records",
    href: "/records",
    icon: ClipboardCheck,
  },
  {
    title: "BMI Calculator",
    href: "/bmi",
    icon: Scale,
  },
  {
    title: "Vital Signs",
    href: "/vitals",
    icon: Activity,
  },
  {
    title: "Health Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
]; 