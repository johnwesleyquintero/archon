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
import { handleAuthAction } from "@/lib/auth/actions"; // Import the server action

export default function SignInPage() {
  return (
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
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <AuthForm handleAuthAction={handleAuthAction} /> {/* Pass the server action as a prop */}
          </Suspense>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="underline text-muted-foreground hover:text-foreground"
            >
              Sign up
            </Link>
          </div>
          <div className="mt-2 text-center text-sm">
            <Link
              href="/auth/forgot-password"
              className="underline text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
