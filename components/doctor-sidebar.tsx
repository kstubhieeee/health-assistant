import {
  Activity,
  BarChart3,
  Calendar,
  ClipboardCheck,
  Clock,
  CreditCard,
  LayoutDashboard,
  Search,
  Users,
  User,
  FileText,
  Stethoscope
} from "lucide-react";

export const doctorNavigationItems = [
  {
    title: "Dashboard",
    href: "/doctor/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Appointments",
    href: "/doctor/appointments",
    icon: Calendar,
  },
  {
    title: "Patients",
    href: "/doctor/dashboard/patients",
    icon: Users,
  },
  {
    title: "Medical Records",
    href: "/doctor/dashboard/records",
    icon: FileText,
  },
  {
    title: "Prescriptions",
    href: "/doctor/dashboard/prescriptions",
    icon: ClipboardCheck,
  },
  {
    title: "Consultations",
    href: "/doctor/dashboard/consultations",
    icon: Stethoscope,
  },
]; 