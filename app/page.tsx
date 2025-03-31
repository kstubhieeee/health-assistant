"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, Brain, Heart, Leaf } from "lucide-react";
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
        <Link href="/check">
          <Button size="lg" className="font-semibold">
            Start Health Check
          </Button>
        </Link>
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