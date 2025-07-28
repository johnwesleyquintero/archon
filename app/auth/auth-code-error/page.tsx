import type { Metadata } from "next";
import Link from "next/link";

import { ArchonLogoSVG } from "@/components/archon-logo-svg";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Error - Authorization Code",
  description: "Authorization code error page",
};

interface AuthCodeErrorPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function AuthCodeErrorPage({
  searchParams,
}: AuthCodeErrorPageProps) {
  const message =
    (searchParams?.message as string) ||
    "An unexpected authentication error occurred. Please try again."; // More specific default message

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
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
