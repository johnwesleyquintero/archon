import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ArchonLogoSVG } from "@/components/archon-logo-svg";

import { PageProps } from "@/app/types";

export const metadata: Metadata = {
  title: "Error - Authorization Code",
  description: "Authorization code error page",
};
export default function AuthCodeErrorPage({ searchParams }: PageProps) {
  const message = searchParams?.message ?? "No error message provided";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center">
            <ArchonLogoSVG className="mb-4 h-12 w-12" />
          </div>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>
            {message || "An authentication event occurred."}
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
