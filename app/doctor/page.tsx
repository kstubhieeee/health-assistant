"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  ArrowLeft, 
  Brain, 
  Clipboard, 
  Stethoscope, 
  UserCircle2, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Key,
  UserPlus
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DoctorPage() {
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const router = useRouter();

  // Registration form fields
  const [registrationData, setRegistrationData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    medicalLicense: "",
    specialization: "",
    institution: "",
    credentials: ""
  });
  const [registrationError, setRegistrationError] = useState("");

  const handleRegistrationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegistrationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLogin(true);
    setLoginError("");

    try {
      // Make API call to login
      const response = await fetch("/api/auth/doctor-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // On successful login, redirect to dashboard
      router.push("/doctor/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError(error.message || "Invalid email or password");
      setIsSubmittingLogin(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRegistration(true);
    setRegistrationError("");

    // Validation
    if (registrationData.password !== registrationData.confirmPassword) {
      setRegistrationError("Passwords do not match");
      setIsSubmittingRegistration(false);
      return;
    }

    if (registrationData.password.length < 8) {
      setRegistrationError("Password must be at least 8 characters");
      setIsSubmittingRegistration(false);
      return;
    }

    if (!registrationData.medicalLicense) {
      setRegistrationError("Medical license number is required");
      setIsSubmittingRegistration(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/doctor-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // After successful registration, log the doctor in
      const loginResponse = await fetch("/api/auth/doctor-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registrationData.email,
          password: registrationData.password,
        }),
      });

      if (!loginResponse.ok) {
        // If login fails, just redirect to login page
        router.push("/doctor");
        return;
      }

      // Redirect to dashboard to show verification status
      router.push("/doctor/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      setRegistrationError(error.message || "Registration failed. Please try again.");
      setIsSubmittingRegistration(false);
    }
  };

  // Helper function to switch tabs
  const switchToRegisterTab = () => {
    const registerTab = document.querySelector('[data-value="register"]') as HTMLElement;
    if (registerTab) registerTab.click();
  };
  
  const switchToLoginTab = () => {
    const loginTab = document.querySelector('[data-value="login"]') as HTMLElement;
    if (loginTab) loginTab.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center text-sm mb-8 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Healthcare Professional Portal
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Medical Professional Access</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Secure access to advanced health analytics and AI-powered diagnostic tools for verified healthcare professionals.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Verified Professional Access</h2>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6">
                Our platform provides healthcare professionals with advanced tools and insights:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                    <UserCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Patient Management</h3>
                    <p className="text-xs text-muted-foreground">
                      Monitor multiple patients and track health metrics over time
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                    <Brain className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">AI Diagnostic Support</h3>
                    <p className="text-xs text-muted-foreground">
                      Get AI-powered insights based on comprehensive health data
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Clinical Analytics</h3>
                    <p className="text-xs text-muted-foreground">
                      Access detailed health analytics and predictive insights
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                    <Clipboard className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Report Generation</h3>
                    <p className="text-xs text-muted-foreground">
                      Create professional reports with evidence-based recommendations
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-secondary rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-medium">Verification Process</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  To ensure the highest standards of care, all professional accounts undergo verification. 
                  We verify medical credentials and licenses before granting full access to our professional features.
                </p>
              </div>
            </Card>
          </div>
          
          <div className="md:col-span-3">
            <Card className="p-8">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Register as a Doctor</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <div className="space-y-2 mb-6">
                    <h2 className="text-2xl font-semibold">Sign In</h2>
                    <p className="text-sm text-muted-foreground">
                      Access your professional healthcare dashboard
                    </p>
                  </div>
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    {loginError && (
                      <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                        {loginError}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="email" 
                          type="email" 
                          className="pl-10" 
                          placeholder="doctor@hospital.com" 
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="password" 
                          type="password" 
                          className="pl-10" 
                          placeholder="••••••••" 
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmittingLogin}>
                      {isSubmittingLogin ? "Signing in..." : "Sign In"}
                    </Button>
                    
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mt-4">
                        Don't have a professional account?{" "}
                        <button 
                          type="button" 
                          className="text-primary hover:underline"
                          onClick={switchToRegisterTab}
                        >
                          Register now
                        </button>
                      </p>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-primary" />
                      <h2 className="text-2xl font-semibold">Register as a Healthcare Professional</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Create your account to access professional healthcare tools and features
                    </p>
                  </div>
                  
                  <form onSubmit={handleRegistration} className="space-y-4">
                    {registrationError && (
                      <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                        {registrationError}
                      </div>
                    )}
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input 
                          id="fullName" 
                          name="fullName" 
                          placeholder="Dr. Jane Smith" 
                          value={registrationData.fullName}
                          onChange={handleRegistrationInputChange}
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          name="email"
                          type="email" 
                          placeholder="doctor@hospital.com" 
                          value={registrationData.email}
                          onChange={handleRegistrationInputChange}
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                          id="password" 
                          name="password"
                          type="password" 
                          placeholder="••••••••" 
                          value={registrationData.password}
                          onChange={handleRegistrationInputChange}
                          required 
                        />
                        <p className="text-xs text-muted-foreground">
                          Must be at least 8 characters
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input 
                          id="confirmPassword" 
                          name="confirmPassword"
                          type="password" 
                          placeholder="••••••••" 
                          value={registrationData.confirmPassword}
                          onChange={handleRegistrationInputChange}
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <h3 className="font-medium mb-4">Professional Information</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="medicalLicense">Medical License Number</Label>
                          <Input 
                            id="medicalLicense" 
                            name="medicalLicense"
                            placeholder="ML12345678" 
                            value={registrationData.medicalLicense}
                            onChange={handleRegistrationInputChange}
                            required 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="specialization">Specialization</Label>
                          <Input 
                            id="specialization" 
                            name="specialization"
                            placeholder="Cardiology, Internal Medicine, etc." 
                            value={registrationData.specialization}
                            onChange={handleRegistrationInputChange}
                            required 
                          />
                        </div>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="institution">Institution/Practice</Label>
                          <Input 
                            id="institution" 
                            name="institution"
                            placeholder="City General Hospital" 
                            value={registrationData.institution}
                            onChange={handleRegistrationInputChange}
                            required 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="credentials">Professional Credentials</Label>
                          <Input 
                            id="credentials" 
                            name="credentials"
                            placeholder="MD, FACC, PhD, etc." 
                            value={registrationData.credentials}
                            onChange={handleRegistrationInputChange}
                            required 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id="terms"
                        className="mt-1 border border-input"
                        required
                      />
                      <Label htmlFor="terms" className="text-xs leading-tight">
                        I confirm that I am a licensed healthcare professional and agree to the{" "}
                        <Link href="/terms" className="text-primary hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                        . I understand that my professional credentials will be verified.
                      </Label>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmittingRegistration}>
                      {isSubmittingRegistration ? "Processing..." : "Create Professional Account"}
                    </Button>
                    
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mt-4">
                        Already have an account?{" "}
                        <button 
                          type="button" 
                          className="text-primary hover:underline"
                          onClick={switchToLoginTab}
                        >
                          Sign in
                        </button>
                      </p>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 