// Minor change to trigger Vercel rebuild
"use client";

import Link from "next/link";

import { ArchonLogoSVG } from "@/components/archon-logo-svg";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useSearchParams } from "next/navigation";

export default function AuthCodeErrorPage() {
  const searchParams = useSearchParams();
  const message =
    searchParams.get("message") ||
    "An unexpected authentication error occurred. Please try again."; // More specific default message

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center">
            <ArchonLogoSVG className="mb-4 h-12 w-12" />
          </div>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>
            {message} {/* Directly use the message variable */}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/auth/signin" className="text-blue-600 hover:underline">
            Return to Sign In
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
