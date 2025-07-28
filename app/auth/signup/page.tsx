import Link from "next/link";
import { Suspense } from "react";

import Image from "next/image";
import { AuthForm } from "@/components/auth/auth-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignUpPage() {
  return (
    // Changed 'bg-slate-100' to 'bg-background' to utilize the theme's background color,
    // which is typically white in light mode and a dark gray in dark mode,
    // ensuring full dark mode compatibility without manual switching.
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/favicon.ico"
              alt="Archon Logo"
              width={48}
              height={48}
            />
          </div>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Create a new account to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <AuthForm mode="signUp" />
          </Suspense>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              // Changed link colors to use 'text-primary' for theme compatibility,
              // which automatically adjusts for light and dark modes, providing good contrast.
              // Added a subtle hover effect using 'text-primary/80'.
              className="underline text-primary hover:text-primary/80"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
