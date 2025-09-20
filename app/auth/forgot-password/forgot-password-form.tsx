"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";

import { ArchonLogoSVG } from "@/components/archon-logo-svg";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/utils";

import { forgotPassword } from "./actions";

type State =
  | {
      error: string;
      success?: undefined;
    }
  | {
      success: string;
      error?: undefined;
    }
  | null;

export function ForgotPasswordForm() {
  // const searchParams = useSearchParams(); // Commented out as it's unused
  // const message = searchParams.get("message"); // Commented out as it's unused
  const [state, formAction] = useFormState<State, FormData>(
    async (_prevState: State, formData: FormData) => {
      return forgotPassword(formData);
    },
    null,
  );

  React.useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{" "}
        Back
      </Link>

      <Card className="w-full shadow-xl border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <ArchonLogoSVG className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your email to receive a password reset link
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form className="space-y-4" action={formAction}>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="pl-10 h-11 border-input focus:border-primary focus:ring-primary"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* {message && (
              <Alert
                variant={
                  message.includes("Password reset email sent")
                    ? "default"
                    : "destructive"
                }
              >
                <AlertDescription className="text-sm">
                  {message}
                </AlertDescription>
              </Alert>
            )} */}

            <SubmitButton
              // formAction={forgotPassword}
              className={cn(
                "w-full h-11 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700",
                "text-primary-foreground font-medium transition-all duration-200 shadow-lg hover:shadow-xl",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
              pendingText="Sending..."
            >
              Send Reset Email
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
