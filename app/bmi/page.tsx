"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, ArrowLeft, Scale, Ruler, Info } from "lucide-react";
import Link from "next/link";
import PatientLayout from "@/components/patient-layout";

export default function BMICalculator() {
  const router = useRouter();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("metric"); // metric or imperial
  const [bmi, setBMI] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        
        if (data.user) {
          setIsAuthenticated(true);
        } else {
          // Redirect to login if not authenticated
          router.push("/auth/signin");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/auth/signin");
      } finally {
        setAuthChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  const calculateBMI = () => {
    if (!height || !weight) return;

    let bmiValue: number;
    
    if (unit === "metric") {
      // Height in cm, weight in kg
      const heightInMeters = parseFloat(height) / 100;
      bmiValue = parseFloat(weight) / (heightInMeters * heightInMeters);
    } else {
      // Height in inches, weight in pounds
      bmiValue = (parseFloat(weight) * 703) / (parseFloat(height) * parseFloat(height));
    }
    
    setBMI(parseFloat(bmiValue.toFixed(1)));
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-500", bgColor: "bg-blue-100" };
    if (bmi < 25) return { category: "Normal Weight", color: "text-green-500", bgColor: "bg-green-100" };
    if (bmi < 30) return { category: "Overweight", color: "text-yellow-500", bgColor: "bg-yellow-100" };
    return { category: "Obese", color: "text-red-500", bgColor: "bg-red-100" };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateBMI();
  };

  // Show loading state while checking authentication
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading BMI calculator...</p>
        </div>
      </div>
    );
  }

  return (
    <PatientLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary p-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="mx-auto">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle>BMI Calculator</CardTitle>
              </div>
              <CardDescription>
                Calculate your Body Mass Index to assess your weight relative to height
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Unit System</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit system" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric (cm, kg)</SelectItem>
                      <SelectItem value="imperial">Imperial (in, lbs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height" className="flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      Height {unit === "metric" ? "(cm)" : "(in)"}
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      step="any"
                      placeholder={unit === "metric" ? "Enter height in cm" : "Enter height in inches"}
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="flex items-center gap-2">
                      <Scale className="h-4 w-4" />
                      Weight {unit === "metric" ? "(kg)" : "(lbs)"}
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      step="any"
                      placeholder={unit === "metric" ? "Enter weight in kg" : "Enter weight in pounds"}
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">Calculate BMI</Button>
              </form>
              
              {bmi !== null && (
                <div className="mt-8 p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-2">Your BMI Result</h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">Underweight</span>
                    <span className="text-sm text-muted-foreground">Normal</span>
                    <span className="text-sm text-muted-foreground">Overweight</span>
                    <span className="text-sm text-muted-foreground">Obese</span>
                  </div>
                  
                  <div className="relative h-4 bg-gray-200 rounded-full mb-6">
                    <div className="absolute inset-0 flex">
                      <div className="h-full w-1/4 bg-blue-500 rounded-l-full"></div>
                      <div className="h-full w-1/4 bg-green-500"></div>
                      <div className="h-full w-1/4 bg-yellow-500"></div>
                      <div className="h-full w-1/4 bg-red-500 rounded-r-full"></div>
                    </div>
                    
                    {/* BMI marker */}
                    <div 
                      className="absolute top-0 w-4 h-6 bg-white border border-gray-400 rounded transform -translate-x-1/2"
                      style={{ 
                        left: `${Math.min(Math.max((bmi - 10) * 3.3, 0), 100)}%`,
                        marginTop: "-4px"
                      }}
                    ></div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold mb-1">{bmi}</div>
                    <Badge className={`${getBMICategory(bmi).bgColor} ${getBMICategory(bmi).color}`}>
                      {getBMICategory(bmi).category}
                    </Badge>
                  </div>
                  
                  <div className="text-sm border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">BMI Categories:</span>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>Underweight: Less than 18.5</li>
                      <li>Normal weight: 18.5 - 24.9</li>
                      <li>Overweight: 25 - 29.9</li>
                      <li>Obesity: 30 or greater</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </div>
    </PatientLayout>
  );
}
