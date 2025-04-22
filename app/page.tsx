"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, Brain, Heart, Leaf, Stethoscope, UserCircle2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Navigation */}
     

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <Badge variant="outline" className="mb-4">
          AI-Powered Health Analysis
        </Badge>
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
          Your Personal Health Analysis Assistant
        </h1>
        <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground">
          Get personalized health insights powered by advanced AI. Simply input your health data
          and receive comprehensive analysis and recommendations.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/check">
            <Button size="lg" className="font-semibold">
              Start Health Check
            </Button>
          </Link>
          <Link href="/doctor">
            <Button size="lg" variant="outline" className="font-semibold">
              <Stethoscope className="mr-2 h-4 w-4" />
              For Healthcare Professionals
            </Button>
          </Link>
        </div>
      </section>

      {/* Doctor Section */}
      <section className="container mx-auto px-4 py-12 my-8">
        <div className="bg-background rounded-xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 flex flex-col justify-center">
              <Badge variant="secondary" className="w-fit mb-4">For Medical Professionals</Badge>
              <h2 className="text-3xl font-bold mb-4">Are you a doctor?</h2>
              <p className="text-muted-foreground mb-6">
                Our platform provides medical professionals with advanced tools to help monitor patient health metrics, 
                generate detailed reports, and offer data-driven recommendations based on our AI analysis.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-1">
                    <UserCircle2 className="h-4 w-4" />
                  </Badge>
                  <span>Patient health monitoring dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-1">
                    <Brain className="h-4 w-4" />
                  </Badge>
                  <span>AI-powered diagnostic assistance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-1">
                    <Activity className="h-4 w-4" />
                  </Badge>
                  <span>Evidence-based recommendations</span>
                </div>
              </div>
              <Link href="/doctor" className="mt-6">
                <Button className="font-semibold">
                  <Stethoscope className="mr-2 h-4 w-4" />
                  Join as Healthcare Professional
                </Button>
              </Link>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-secondary p-8 hidden md:flex flex-col justify-center items-center">
              <Stethoscope className="h-32 w-32 text-primary/80 mb-6" />
              <h3 className="text-2xl font-semibold text-center">Healthcare Professional Portal</h3>
              <p className="text-center text-muted-foreground mt-2">
                Access advanced analytics and monitoring tools to better serve your patients
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4">
            Features
          </Badge>
          <h2 className="text-3xl font-bold">Key Features</h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden p-6">
            <Badge className="absolute right-2 top-2" variant="secondary">
              AI
            </Badge>
            <Brain className="mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 font-semibold">AI-Powered Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Advanced machine learning algorithms analyze your health data for accurate insights.
            </p>
          </Card>
          <Card className="relative overflow-hidden p-6">
            <Badge className="absolute right-2 top-2" variant="secondary">
              Personal
            </Badge>
            <Heart className="mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 font-semibold">Personalized Insights</h3>
            <p className="text-sm text-muted-foreground">
              Receive tailored health recommendations based on your unique profile.
            </p>
          </Card>
          <Card className="relative overflow-hidden p-6">
            <Badge className="absolute right-2 top-2" variant="secondary">
              Analytics
            </Badge>
            <Activity className="mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 font-semibold">Data-Driven Reports</h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive health reports backed by statistical analysis.
            </p>
          </Card>
          <Card className="relative overflow-hidden p-6">
            <Badge className="absolute right-2 top-2" variant="secondary">
              Lifestyle
            </Badge>
            <Leaf className="mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 font-semibold">Lifestyle Guidance</h3>
            <p className="text-sm text-muted-foreground">
              Get practical advice for improving your daily health habits.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
   
    </div>
  );
}