"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Loader2, Activity, Heart, AlertTriangle, CheckCircle, Cigarette, Wine, Apple, Dumbbell, Brain, ShieldAlert, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { marked } from "marked";
import PatientLayout from "@/components/patient-layout";

const formSchema = z.object({
  highBP: z.boolean(),
  highCholesterol: z.boolean(),
  bmi: z.string(),
  smoker: z.boolean(),
  stroke: z.boolean(),
  heartDisease: z.boolean(),
  physicalActivity: z.boolean(),
  fruitsConsumption: z.boolean(),
  vegetablesConsumption: z.boolean(),
  heavyAlcohol: z.boolean(),
  generalHealth: z.string(),
  mentalHealth: z.string(),
  physicalHealth: z.string(),
  difficultyWalking: z.boolean(),
  sex: z.string(),
  age: z.string(),
});

export default function HealthCheck() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      highBP: false,
      highCholesterol: false,
      bmi: "",
      smoker: false,
      stroke: false,
      heartDisease: false,
      physicalActivity: false,
      fruitsConsumption: false,
      vegetablesConsumption: false,
      heavyAlcohol: false,
      generalHealth: "",
      mentalHealth: "",
      physicalHealth: "",
      difficultyWalking: false,
      sex: "",
      age: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await fetch("/api/health-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_value: JSON.stringify({
            age: parseInt(data.age),
            sex: data.sex,
            bmi: parseFloat(data.bmi),
            health_conditions: {
              high_bp: data.highBP,
              high_cholesterol: data.highCholesterol,
              stroke: data.stroke,
              heart_disease: data.heartDisease,
            },
            lifestyle: {
              smoker: data.smoker,
              physical_activity: data.physicalActivity,
              fruits_consumption: data.fruitsConsumption,
              vegetables_consumption: data.vegetablesConsumption,
              heavy_alcohol: data.heavyAlcohol,
            },
            health_status: {
              general_health: data.generalHealth,
              mental_health: parseInt(data.mentalHealth),
              physical_health: parseInt(data.physicalHealth),
              difficulty_walking: data.difficultyWalking,
            }
          }),
          input_type: "chat",
          output_type: "chat",
          tweaks: {
            "ChatInput-sDv2I": {},
            "GoogleGenerativeAIModel-xsrJU": {},
            "ChatOutput-ubBb2": {},
            "AstraDB-SbKxl": {},
            "ParseData-IEx10": {}
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error + (errorData.details ? `\nDetails: ${errorData.details}` : ''));
      }

      const result = await response.json();
      setApiResponse(result);
      
      console.log('API Response:', result);
      
    } catch (err) {
      console.error('Detailed error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while submitting the assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const testApiConnection = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await fetch("/api/health-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_value: "Hello from health assessment app!",
          input_type: "chat",
          output_type: "chat"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error + (errorData.details ? `\nDetails: ${errorData.details}` : ''));
      }

      const result = await response.json();
      setApiResponse(result);
      
      console.log('Test API Response:', result);
      
    } catch (err) {
      console.error('Test API error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while testing API connection');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <PatientLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary p-6">
        <Card className="mx-auto max-w-4xl p-6">
          <div className="mb-8 text-center">
            <Badge variant="outline" className="mb-4">
              Health Assessment
            </Badge>
            <h1 className="text-2xl font-bold">Health Assessment Form</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Welcome back, {session.user?.name}! Please complete your health assessment.
            </p>
          </div>
          <Form {...form}>
            <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <div className="space-y-4">
                  <Badge variant="secondary" className="mb-2">
                    Basic Information
                  </Badge>
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter your age" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sex</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your sex" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bmi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>BMI</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="Enter your BMI" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Health Conditions */}
                <div className="space-y-4">
                  <Badge variant="secondary" className="mb-2">
                    Health Conditions
                  </Badge>
                  <FormField
                    control={form.control}
                    name="highBP"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">High Blood Pressure</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="highCholesterol"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">High Cholesterol</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Lifestyle Factors */}
                <div className="space-y-4">
                  <Badge variant="secondary" className="mb-2">
                    Lifestyle Factors
                  </Badge>
                  <FormField
                    control={form.control}
                    name="smoker"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Smoker</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="physicalActivity"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Physical Activity</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Health Status */}
                <div className="space-y-4">
                  <Badge variant="secondary" className="mb-2">
                    Health Status
                  </Badge>
                  <FormField
                    control={form.control}
                    name="generalHealth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>General Health</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your general health status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="excellent">Excellent</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                            <SelectItem value="poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mentalHealth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Days of Poor Mental Health
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4" />
                              </TooltipTrigger>
                              <TooltipContent>Number of days in the past 30 days</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="30" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Assessment"
                  )}
                </Button>
               
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              {apiResponse && (
                <div className="mt-8 p-6 bg-secondary rounded-lg shadow-lg">
                  <div className="flex items-center mb-6 gap-2">
                    <Activity className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-semibold">Health Assessment Results</h3>
                  </div>
                  
                  {apiResponse.outputs?.[0]?.outputs?.[0]?.outputs?.message?.message ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Health Summary Card */}
                        <div className="bg-background rounded-lg p-4 shadow-sm border border-border">
                          <div className="flex items-center gap-2 mb-3">
                            <Heart className="h-5 w-5 text-red-500" />
                            <h4 className="font-medium">Health Summary</h4>
                          </div>
                          <Badge className="mb-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                            <User className="h-3 w-3 mr-1" />
                            {JSON.parse(apiResponse.outputs[0].inputs.input_value).age} Years Old
                          </Badge>
                          <Badge className="ml-2 mb-2 bg-purple-100 text-purple-800 hover:bg-purple-100">
                            {JSON.parse(apiResponse.outputs[0].inputs.input_value).sex === "male" ? "♂ Male" : "♀ Female"}
                          </Badge>
                          <Badge className="ml-2 mb-2 bg-green-100 text-green-800 hover:bg-green-100">
                            <Activity className="h-3 w-3 mr-1" />
                            BMI: {JSON.parse(apiResponse.outputs[0].inputs.input_value).bmi}
                          </Badge>
                        </div>
                        
                        {/* Health Conditions Card */}
                        <div className="bg-background rounded-lg p-4 shadow-sm border border-border">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            <h4 className="font-medium">Health Conditions</h4>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-1 text-sm">
                              <Badge className={JSON.parse(apiResponse.outputs[0].inputs.input_value).health_conditions.high_bp ? 
                                "bg-red-100 text-red-800 hover:bg-red-100" : 
                                "bg-green-100 text-green-800 hover:bg-green-100"}>
                                <ShieldAlert className="h-3 w-3 mr-1" />
                                {JSON.parse(apiResponse.outputs[0].inputs.input_value).health_conditions.high_bp ? 
                                  "High Blood Pressure" : "Normal Blood Pressure"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Badge className={JSON.parse(apiResponse.outputs[0].inputs.input_value).health_conditions.high_cholesterol ? 
                                "bg-red-100 text-red-800 hover:bg-red-100" : 
                                "bg-green-100 text-green-800 hover:bg-green-100"}>
                                <ShieldAlert className="h-3 w-3 mr-1" />
                                {JSON.parse(apiResponse.outputs[0].inputs.input_value).health_conditions.high_cholesterol ? 
                                  "High Cholesterol" : "Normal Cholesterol"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Lifestyle Section */}
                      <div className="bg-background rounded-lg p-4 shadow-sm border border-border mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Dumbbell className="h-5 w-5 text-indigo-500" />
                          <h4 className="font-medium">Lifestyle</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={JSON.parse(apiResponse.outputs[0].inputs.input_value).lifestyle.smoker ? 
                            "bg-red-100 text-red-800 hover:bg-red-100" : 
                            "bg-green-100 text-green-800 hover:bg-green-100"}>
                            <Cigarette className="h-3 w-3 mr-1" />
                            {JSON.parse(apiResponse.outputs[0].inputs.input_value).lifestyle.smoker ? "Smoker" : "Non-Smoker"}
                          </Badge>
                          <Badge className={JSON.parse(apiResponse.outputs[0].inputs.input_value).lifestyle.physical_activity ? 
                            "bg-green-100 text-green-800 hover:bg-green-100" : 
                            "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}>
                            <Dumbbell className="h-3 w-3 mr-1" />
                            {JSON.parse(apiResponse.outputs[0].inputs.input_value).lifestyle.physical_activity ? 
                              "Physically Active" : "Limited Physical Activity"}
                          </Badge>
                          <Badge className={JSON.parse(apiResponse.outputs[0].inputs.input_value).lifestyle.fruits_consumption ? 
                            "bg-green-100 text-green-800 hover:bg-green-100" : 
                            "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}>
                            <Apple className="h-3 w-3 mr-1" />
                            {JSON.parse(apiResponse.outputs[0].inputs.input_value).lifestyle.fruits_consumption ? 
                              "Consumes Fruits" : "Limited Fruit Consumption"}
                          </Badge>
                          <Badge className={JSON.parse(apiResponse.outputs[0].inputs.input_value).lifestyle.heavy_alcohol ? 
                            "bg-red-100 text-red-800 hover:bg-red-100" : 
                            "bg-green-100 text-green-800 hover:bg-green-100"}>
                            <Wine className="h-3 w-3 mr-1" />
                            {JSON.parse(apiResponse.outputs[0].inputs.input_value).lifestyle.heavy_alcohol ? 
                              "Heavy Alcohol Use" : "Moderate/No Alcohol Use"}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Analysis Results */}
                      <div className="bg-background rounded-lg p-4 shadow-sm border border-border">
                        <div className="flex items-center gap-2 mb-3">
                          <Brain className="h-5 w-5 text-primary" />
                          <h4 className="font-medium">Detailed Analysis</h4>
                        </div>
                        <div 
                          className="markdown-content prose prose-sm max-w-none dark:prose-invert"
                          dangerouslySetInnerHTML={{ 
                            __html: marked.parse(apiResponse.outputs[0].outputs[0].outputs.message.message) 
                          }}
                        />
                      </div>
                    </div>
                  ) : apiResponse.type === 'text' ? (
                    <div 
                      className="markdown-content prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ 
                        __html: marked.parse(apiResponse.text) 
                      }}
                    />
                  ) : (
                    <pre className="text-sm whitespace-pre-wrap bg-background rounded-lg p-4 shadow-sm border border-border">
                      {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </form>
          </Form>
        </Card>
      </div>
    </PatientLayout>
  );
}