"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Heart, ArrowUpRight, Thermometer, LineChart, Plus, X, Calendar } from "lucide-react";
import { format } from "date-fns";
import PatientLayout from "@/components/patient-layout";

// Define types for vital signs
interface VitalSign {
  id: string;
  date: Date;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
}

export default function VitalsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [latestVitals, setLatestVitals] = useState<VitalSign | null>(null);
  
  // Form state
  const [newVital, setNewVital] = useState({
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    heartRate: "",
    temperature: "",
    oxygenSaturation: ""
  });

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

  // Load saved vital signs from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVitals = localStorage.getItem('vitalSigns');
      if (savedVitals) {
        const parsedVitals = JSON.parse(savedVitals).map((vital: any) => ({
          ...vital,
          date: new Date(vital.date)
        }));
        setVitalSigns(parsedVitals);
        
        // Set latest vitals
        if (parsedVitals.length > 0) {
          const sorted = [...parsedVitals].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setLatestVitals(sorted[0]);
        }
      }
    }
  }, []);

  // Handle input change for new vital signs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewVital(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save new vital signs
  const handleSaveVitals = () => {
    // Validate inputs
    if (!newVital.bloodPressureSystolic || !newVital.bloodPressureDiastolic || 
        !newVital.heartRate || !newVital.temperature || !newVital.oxygenSaturation) {
      alert("Please fill in all vital sign fields");
      return;
    }

    const newVitalSign: VitalSign = {
      id: Date.now().toString(),
      date: new Date(),
      bloodPressureSystolic: Number(newVital.bloodPressureSystolic),
      bloodPressureDiastolic: Number(newVital.bloodPressureDiastolic),
      heartRate: Number(newVital.heartRate),
      temperature: Number(newVital.temperature),
      oxygenSaturation: Number(newVital.oxygenSaturation)
    };

    const updatedVitals = [...vitalSigns, newVitalSign];
    setVitalSigns(updatedVitals);
    setLatestVitals(newVitalSign);
    
    // Save to localStorage
    localStorage.setItem('vitalSigns', JSON.stringify(updatedVitals));
    
    // Reset form and close dialog
    setNewVital({
      bloodPressureSystolic: "",
      bloodPressureDiastolic: "",
      heartRate: "",
      temperature: "",
      oxygenSaturation: ""
    });
    setDialogOpen(false);
  };

  // Delete a vital sign record
  const handleDeleteVital = (id: string) => {
    const updatedVitals = vitalSigns.filter(vital => vital.id !== id);
    setVitalSigns(updatedVitals);
    
    // Update latest vitals
    if (updatedVitals.length > 0) {
      const sorted = [...updatedVitals].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setLatestVitals(sorted[0]);
    } else {
      setLatestVitals(null);
    }
    
    // Save to localStorage
    localStorage.setItem('vitalSigns', JSON.stringify(updatedVitals));
  };

  // Show loading state while checking authentication
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading vital signs...</p>
        </div>
      </div>
    );
  }

  return (
    <PatientLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Vital Signs</h1>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Record New Vitals
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Record Vital Signs</DialogTitle>
                  <DialogDescription>
                    Enter your current vital sign measurements
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bloodPressureSystolic">Systolic Pressure</Label>
                      <Input
                        id="bloodPressureSystolic"
                        name="bloodPressureSystolic"
                        type="number"
                        placeholder="mmHg"
                        value={newVital.bloodPressureSystolic}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bloodPressureDiastolic">Diastolic Pressure</Label>
                      <Input
                        id="bloodPressureDiastolic"
                        name="bloodPressureDiastolic"
                        type="number"
                        placeholder="mmHg"
                        value={newVital.bloodPressureDiastolic}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heartRate">Heart Rate</Label>
                    <Input
                      id="heartRate"
                      name="heartRate"
                      type="number"
                      placeholder="bpm"
                      value={newVital.heartRate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Body Temperature</Label>
                    <Input
                      id="temperature"
                      name="temperature"
                      type="number"
                      step="0.1"
                      placeholder="°F"
                      value={newVital.temperature}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oxygenSaturation">Oxygen Saturation</Label>
                    <Input
                      id="oxygenSaturation"
                      name="oxygenSaturation"
                      type="number"
                      placeholder="%"
                      value={newVital.oxygenSaturation}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSaveVitals}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {latestVitals ? 
                    `${latestVitals.bloodPressureSystolic}/${latestVitals.bloodPressureDiastolic} mmHg` : 
                    "--/-- mmHg"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {latestVitals ? 
                    `Last recorded: ${format(latestVitals.date, "MMM d, yyyy")}` : 
                    "No data recorded"}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                  <Heart className="h-4 w-4 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {latestVitals ? `${latestVitals.heartRate} bpm` : "-- bpm"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {latestVitals ? 
                    `Last recorded: ${format(latestVitals.date, "MMM d, yyyy")}` : 
                    "No data recorded"}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Body Temperature</CardTitle>
                  <Thermometer className="h-4 w-4 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {latestVitals ? `${latestVitals.temperature}°F` : "--°F"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {latestVitals ? 
                    `Last recorded: ${format(latestVitals.date, "MMM d, yyyy")}` : 
                    "No data recorded"}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Oxygen Saturation</CardTitle>
                  <Activity className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {latestVitals ? `${latestVitals.oxygenSaturation}%` : "--%"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {latestVitals ? 
                    `Last recorded: ${format(latestVitals.date, "MMM d, yyyy")}` : 
                    "No data recorded"}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-primary" />
                  <CardTitle>Vital Signs History</CardTitle>
                </div>
              </div>
              <CardDescription>
                Track and monitor your vital signs over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vitalSigns.length > 0 ? (
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All Records</TabsTrigger>
                    <TabsTrigger value="bloodPressure">Blood Pressure</TabsTrigger>
                    <TabsTrigger value="heartRate">Heart Rate</TabsTrigger>
                    <TabsTrigger value="temperature">Temperature</TabsTrigger>
                    <TabsTrigger value="oxygen">Oxygen</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all">
                    <div className="rounded-md border">
                      <div className="grid grid-cols-7 font-medium border-b p-2 bg-muted/50">
                        <div className="col-span-1">Date</div>
                        <div className="col-span-1">Time</div>
                        <div className="col-span-1">BP (mmHg)</div>
                        <div className="col-span-1">Heart Rate</div>
                        <div className="col-span-1">Temp (°F)</div>
                        <div className="col-span-1">O₂ (%)</div>
                        <div className="col-span-1"></div>
                      </div>
                      
                      <div className="max-h-[400px] overflow-auto">
                        {[...vitalSigns]
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((vital) => (
                            <div key={vital.id} className="grid grid-cols-7 p-2 border-b last:border-0 hover:bg-muted/30">
                              <div className="col-span-1">{format(new Date(vital.date), "MMM d, yyyy")}</div>
                              <div className="col-span-1">{format(new Date(vital.date), "h:mm a")}</div>
                              <div className="col-span-1">{vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}</div>
                              <div className="col-span-1">{vital.heartRate} bpm</div>
                              <div className="col-span-1">{vital.temperature}°F</div>
                              <div className="col-span-1">{vital.oxygenSaturation}%</div>
                              <div className="col-span-1 text-right">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDeleteVital(vital.id)}
                                  className="h-6 w-6 text-red-500"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Other tabs would have different visualizations of the data */}
                  <TabsContent value="bloodPressure">
                    <div className="rounded-md border p-4">
                      <h3 className="text-xl font-medium mb-4">Blood Pressure History</h3>
                      <div className="h-[300px] flex items-center justify-center">
                        <p className="text-muted-foreground text-center">
                          Blood pressure visualization would appear here.<br />
                          You have {vitalSigns.length} blood pressure readings.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="heartRate">
                    <div className="rounded-md border p-4">
                      <h3 className="text-xl font-medium mb-4">Heart Rate History</h3>
                      <div className="h-[300px] flex items-center justify-center">
                        <p className="text-muted-foreground text-center">
                          Heart rate visualization would appear here.<br />
                          You have {vitalSigns.length} heart rate readings.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="temperature">
                    <div className="rounded-md border p-4">
                      <h3 className="text-xl font-medium mb-4">Temperature History</h3>
                      <div className="h-[300px] flex items-center justify-center">
                        <p className="text-muted-foreground text-center">
                          Temperature visualization would appear here.<br />
                          You have {vitalSigns.length} temperature readings.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="oxygen">
                    <div className="rounded-md border p-4">
                      <h3 className="text-xl font-medium mb-4">Oxygen Saturation History</h3>
                      <div className="h-[300px] flex items-center justify-center">
                        <p className="text-muted-foreground text-center">
                          Oxygen saturation visualization would appear here.<br />
                          You have {vitalSigns.length} oxygen saturation readings.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No vital signs data available yet. Start recording your vitals to see your history.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setDialogOpen(true)}
                  >
                    Record Vitals Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </div>
    </PatientLayout>
  );
}
