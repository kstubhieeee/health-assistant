import { AuthProvider } from "@/components/providers/auth-provider"
import "../globals.css"
import type { Metadata } from "next"
import DoctorLayout from "@/components/doctor-layout"

export const metadata: Metadata = {
  title: "Doctor Portal - Health App",
  description: "Doctor Portal for Health App",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
} 