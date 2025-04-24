"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Activity, 
  Heart, 
  Thermometer, 
  Droplet,
  Calendar,
  Info,
  Loader2 
} from "lucide-react";
import { PatientLayout } from "@/components/patient-layout";
import { DateDisplay } from "@/components/date-display";

export default function HealthAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [vitalsData, setVitalsData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState("30");
  const [chartType, setChartType] = useState("line");

  useEffect(() => {
    // Check if user is logged in
    const checkSession = async () => {
      try {
        // In a real application, you would fetch the session from an API
        // For now, we'll simulate it with a timeout
        setTimeout(() => {
          const mockUserData = {
            id: "user123",
            name: "John Doe",
            email: "john@example.com"
          };
          setUserData(mockUserData);
          
          // Load vitals data from localStorage
          loadVitalsData();
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to check session:", error);
        router.push("/sign-in");
      }
    };

    checkSession();
  }, [router]);

  const loadVitalsData = () => {
    try {
      const storedVitals = localStorage.getItem("vitals");
      if (storedVitals) {
        const parsedVitals = JSON.parse(storedVitals);
        if (Array.isArray(parsedVitals) && parsedVitals.length > 0) {
          // Sort by date (newest first)
          const sortedVitals = parsedVitals.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setVitalsData(sortedVitals);
        }
      }
    } catch (error) {
      console.error("Error loading vitals data:", error);
    }
  };

  // Get date range for filtering
  const getDateRange = () => {
    const now = new Date();
    const days = parseInt(timeRange);
    const pastDate = new Date(now);
    pastDate.setDate(now.getDate() - days);
    return { start: pastDate, end: now };
  };

  // Filter vitals data by date range
  const getFilteredVitalsData = () => {
    const { start } = getDateRange();
    return vitalsData.filter(
      (vital) => new Date(vital.date) >= start
    );
  };

  // Group vitals data by date for visualization
  const getChartData = () => {
    const filteredData = getFilteredVitalsData();
    // Group by date (YYYY-MM-DD)
    const groupedData = filteredData.reduce((acc, vital) => {
      const date = new Date(vital.date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(vital);
      return acc;
    }, {});

    // For simplicity, use the first entry for each day
    return Object.keys(groupedData).map(date => {
      const vitals = groupedData[date][0];
      return {
        date,
        systolic: vitals.systolic || 0,
        diastolic: vitals.diastolic || 0,
        heartRate: vitals.heartRate || 0,
        temperature: vitals.temperature || 0,
        oxygenSaturation: vitals.oxygenSaturation || 0
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  if (loading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Loading health analytics...</p>
          </div>
        </div>
      </PatientLayout>
    );
  }

  const chartData = getChartData();
  const hasData = chartData.length > 0;

  return (
    <PatientLayout>
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Health Analytics</h1>
            <p className="text-muted-foreground">
              Visualize and analyze your health data over time
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div>
              <Label htmlFor="timeRange" className="mb-1 block">Time Period</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger id="timeRange" className="w-[140px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="180">Last 6 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="chartType" className="mb-1 block">Chart Type</Label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger id="chartType" className="w-[140px]">
                  <SelectValue placeholder="Select chart" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="bloodPressure" className="flex items-center gap-1">
              <Droplet className="h-4 w-4" />
              Blood Pressure
            </TabsTrigger>
            <TabsTrigger value="heartRate" className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              Heart Rate
            </TabsTrigger>
            <TabsTrigger value="other" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Other Vitals
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {hasData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Summary Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Summary Statistics
                    </CardTitle>
                    <CardDescription>
                      Overview of your health metrics for the selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Average Blood Pressure</p>
                        <p className="text-2xl font-bold">
                          {Math.round(chartData.reduce((acc, item) => acc + item.systolic, 0) / chartData.length)}/
                          {Math.round(chartData.reduce((acc, item) => acc + item.diastolic, 0) / chartData.length)}
                          <span className="text-sm font-normal text-muted-foreground"> mmHg</span>
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Average Heart Rate</p>
                        <p className="text-2xl font-bold">
                          {Math.round(chartData.reduce((acc, item) => acc + item.heartRate, 0) / chartData.length)}
                          <span className="text-sm font-normal text-muted-foreground"> bpm</span>
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Average Temperature</p>
                        <p className="text-2xl font-bold">
                          {(chartData.reduce((acc, item) => acc + item.temperature, 0) / chartData.length).toFixed(1)}
                          <span className="text-sm font-normal text-muted-foreground"> °F</span>
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Average O₂ Saturation</p>
                        <p className="text-2xl font-bold">
                          {Math.round(chartData.reduce((acc, item) => acc + item.oxygenSaturation, 0) / chartData.length)}
                          <span className="text-sm font-normal text-muted-foreground"> %</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <p className="text-sm font-medium mb-2">Data Points</p>
                      <div className="flex items-center justify-between text-sm">
                        <p>First Reading: <DateDisplay date={new Date(chartData[0].date)} format="PP" /></p>
                        <p>Last Reading: <DateDisplay date={new Date(chartData[chartData.length - 1].date)} format="PP" /></p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {chartData.length} readings over {timeRange} days
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Trends Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5" />
                      Health Trends
                    </CardTitle>
                    <CardDescription>
                      Notable changes and trends in your health metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {chartData.length > 1 ? (
                        <>
                          <div className="p-4 rounded-lg bg-background border">
                            <h4 className="font-medium mb-2">Blood Pressure Trend</h4>
                            <p className="text-sm text-muted-foreground">
                              {(() => {
                                const first = chartData[0].systolic;
                                const last = chartData[chartData.length - 1].systolic;
                                const diff = last - first;
                                const trend = diff > 5 ? "rising" : diff < -5 ? "declining" : "stable";
                                
                                return trend === "stable" 
                                  ? "Your blood pressure has remained relatively stable." 
                                  : trend === "rising" 
                                  ? "Your systolic blood pressure has increased by " + Math.abs(diff) + " mmHg." 
                                  : "Your systolic blood pressure has decreased by " + Math.abs(diff) + " mmHg.";
                              })()}
                            </p>
                          </div>
                          
                          <div className="p-4 rounded-lg bg-background border">
                            <h4 className="font-medium mb-2">Heart Rate Trend</h4>
                            <p className="text-sm text-muted-foreground">
                              {(() => {
                                const first = chartData[0].heartRate;
                                const last = chartData[chartData.length - 1].heartRate;
                                const diff = last - first;
                                const trend = diff > 5 ? "rising" : diff < -5 ? "declining" : "stable";
                                
                                return trend === "stable" 
                                  ? "Your heart rate has remained relatively stable." 
                                  : trend === "rising" 
                                  ? "Your heart rate has increased by " + Math.abs(diff) + " bpm." 
                                  : "Your heart rate has decreased by " + Math.abs(diff) + " bpm.";
                              })()}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            More data points are needed to analyze trends.
                            <br />
                            Record your vitals regularly to see trends over time.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Visualization Card */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Health Metrics Visualization
                    </CardTitle>
                    <CardDescription>
                      Visual representation of your health data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center bg-background rounded-lg border">
                      <div className="text-center p-8">
                        <LineChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium">Health Data Visualization</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Here would be a chart visualizing your health metrics over time.
                          <br />
                          In a real application, this would be a dynamic chart built with a library like Recharts or Chart.js.
                        </p>
                        <Button variant="outline" onClick={() => router.push('/vitals')}>
                          Record More Vitals
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <LineChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-medium mb-2">No Health Data Available</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  We don't have enough health data to provide meaningful analytics.
                  Start recording your vital signs regularly to see insights and trends.
                </p>
                <Button onClick={() => router.push('/vitals')}>
                  Record Your Vitals
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Blood Pressure Tab */}
          <TabsContent value="bloodPressure">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplet className="h-5 w-5" />
                  Blood Pressure Analysis
                </CardTitle>
                <CardDescription>
                  Detailed analysis of your blood pressure readings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasData ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-background border">
                      <h4 className="font-medium mb-2">Blood Pressure Categories</h4>
                      <p className="text-sm mb-4">Based on your recent readings:</p>
                      
                      <div className="space-y-2">
                        {(() => {
                          const lastReading = chartData[chartData.length - 1];
                          let category = "Normal";
                          let color = "text-green-600";
                          
                          if (lastReading.systolic >= 140 || lastReading.diastolic >= 90) {
                            category = "High Blood Pressure (Hypertension)";
                            color = "text-red-600";
                          } else if (lastReading.systolic >= 130 || lastReading.diastolic >= 80) {
                            category = "Elevated Blood Pressure";
                            color = "text-amber-600";
                          }
                          
                          return (
                            <div className="p-3 rounded-lg bg-secondary">
                              <div className="flex justify-between">
                                <span className="font-medium">Latest Reading:</span>
                                <span>{lastReading.systolic}/{lastReading.diastolic} mmHg</span>
                              </div>
                              <div className="flex justify-between mt-1">
                                <span className="font-medium">Category:</span>
                                <span className={color}>{category}</span>
                              </div>
                              <div className="flex justify-between mt-1">
                                <span className="font-medium">Date:</span>
                                <span><DateDisplay date={new Date(lastReading.date)} format="PP" /></span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    
                    <div className="h-64 flex items-center justify-center bg-background rounded-lg border">
                      <div className="text-center p-4">
                        <p className="text-muted-foreground">
                          Blood pressure chart visualization would be displayed here.
                          <br />
                          The chart would show systolic and diastolic values over time.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Droplet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      No blood pressure data available.
                      <br />
                      Record your blood pressure to see analysis and trends.
                    </p>
                    <Button onClick={() => router.push('/vitals')}>
                      Record Blood Pressure
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Heart Rate Tab */}
          <TabsContent value="heartRate">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Heart Rate Analysis
                </CardTitle>
                <CardDescription>
                  Detailed analysis of your heart rate readings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasData ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-background border">
                      <h4 className="font-medium mb-2">Heart Rate Overview</h4>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-secondary">
                          <div className="text-sm text-muted-foreground">Average</div>
                          <div className="text-xl font-bold">
                            {Math.round(chartData.reduce((acc, item) => acc + item.heartRate, 0) / chartData.length)} bpm
                          </div>
                        </div>
                        
                        <div className="p-3 rounded-lg bg-secondary">
                          <div className="text-sm text-muted-foreground">Minimum</div>
                          <div className="text-xl font-bold">
                            {Math.min(...chartData.map(item => item.heartRate))} bpm
                          </div>
                        </div>
                        
                        <div className="p-3 rounded-lg bg-secondary">
                          <div className="text-sm text-muted-foreground">Maximum</div>
                          <div className="text-xl font-bold">
                            {Math.max(...chartData.map(item => item.heartRate))} bpm
                          </div>
                        </div>
                        
                        <div className="p-3 rounded-lg bg-secondary">
                          <div className="text-sm text-muted-foreground">Latest</div>
                          <div className="text-xl font-bold">
                            {chartData[chartData.length - 1].heartRate} bpm
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        A normal resting heart rate for adults ranges from 60 to 100 beats per minute.
                        Generally, a lower heart rate at rest implies more efficient heart function.
                      </p>
                    </div>
                    
                    <div className="h-64 flex items-center justify-center bg-background rounded-lg border">
                      <div className="text-center p-4">
                        <p className="text-muted-foreground">
                          Heart rate chart visualization would be displayed here.
                          <br />
                          The chart would show heart rate values over time.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      No heart rate data available.
                      <br />
                      Record your heart rate to see analysis and trends.
                    </p>
                    <Button onClick={() => router.push('/vitals')}>
                      Record Heart Rate
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other Vitals Tab */}
          <TabsContent value="other">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Temperature Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5" />
                    Temperature Analysis
                  </CardTitle>
                  <CardDescription>
                    Detailed analysis of your body temperature
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hasData ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-background border">
                        <h4 className="font-medium mb-2">Temperature Overview</h4>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="p-3 rounded-lg bg-secondary">
                            <div className="text-sm text-muted-foreground">Average</div>
                            <div className="text-xl font-bold">
                              {(chartData.reduce((acc, item) => acc + item.temperature, 0) / chartData.length).toFixed(1)}°F
                            </div>
                          </div>
                          
                          <div className="p-3 rounded-lg bg-secondary">
                            <div className="text-sm text-muted-foreground">Latest</div>
                            <div className="text-xl font-bold">
                              {chartData[chartData.length - 1].temperature}°F
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <DateDisplay date={new Date(chartData[chartData.length - 1].date)} format="PP" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Thermometer className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No temperature data available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Oxygen Saturation Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Oxygen Saturation Analysis
                  </CardTitle>
                  <CardDescription>
                    Detailed analysis of your oxygen saturation levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hasData ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-background border">
                        <h4 className="font-medium mb-2">Oxygen Saturation Overview</h4>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="p-3 rounded-lg bg-secondary">
                            <div className="text-sm text-muted-foreground">Average</div>
                            <div className="text-xl font-bold">
                              {Math.round(chartData.reduce((acc, item) => acc + item.oxygenSaturation, 0) / chartData.length)}%
                            </div>
                          </div>
                          
                          <div className="p-3 rounded-lg bg-secondary">
                            <div className="text-sm text-muted-foreground">Latest</div>
                            <div className="text-xl font-bold">
                              {chartData[chartData.length - 1].oxygenSaturation}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <DateDisplay date={new Date(chartData[chartData.length - 1].date)} format="PP" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Activity className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No oxygen saturation data available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PatientLayout>
  );
} 