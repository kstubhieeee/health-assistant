"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Github, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/check";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary p-4">
      <Card className="w-full max-w-md space-y-6 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access your health dashboard
          </p>
        </div>

        <div className="grid gap-4">
          <Button
            variant="outline"
            onClick={() => signIn("github", { callbackUrl })}
            className="flex items-center gap-2"
          >
            <Github className="h-5 w-5" />
            Continue with GitHub
          </Button>
          
          <Button
            variant="outline"
            onClick={() => signIn("google", { callbackUrl })}
            className="flex items-center gap-2"
          >
            <Image
              src="https://authjs.dev/img/providers/google.svg"
              alt="Google"
              width={20}
              height={20}
            />
            Continue with Google
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => signIn("email", { callbackUrl })}
          className="w-full"
        >
          <Mail className="mr-2 h-5 w-5" />
          Sign in with Email
        </Button>
      </Card>
    </div>
  );
}