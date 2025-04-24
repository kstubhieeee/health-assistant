"use client";

import DoctorLayout from "@/components/doctor-layout";

export default function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DoctorLayout>{children}</DoctorLayout>;
} 