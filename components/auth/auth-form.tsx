"use client";

import type React from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Github,
  Chrome,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validators";
import { z } from "zod";

type LoginFormInputs = z.infer<typeof loginSchema>;

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError, // Rename setError to avoid conflict with component's setError
    clearErrors,
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const handleSocialSignIn = async (provider: "github" | "google") => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error);
      }
    } catch (err) {
      setError(new Error("An unexpected error occurred. Please try again."));
      console.error("Social sign in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (data: LoginFormInputs) => {
    setIsLoading(true);
    setError(null);
    clearErrors(); // Clear react-hook-form errors

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        const errorMessage = signInError.message;

        if (errorMessage.includes("Invalid login credentials")) {
          setFormError("email", {
            type: "manual",
            message: "Invalid email or password.",
          });
          setFormError("password", {
            type: "manual",
            message: "Invalid email or password.",
          });
          setError(
            new Error(
              "Invalid email or password. Please check your credentials and try again.",
            ),
          );
        } else if (errorMessage.includes("Email not confirmed")) {
          setFormError("email", {
            type: "manual",
            message:
              "Please check your email and click the confirmation link before signing in.",
          });
          setError(
            new Error(
              "Please check your email and click the confirmation link before signing in.",
            ),
          );
        } else {
          setError(signInError);
        }
        return;
      }

      // Success - redirect will be handled by the middleware
      router.refresh();
    } catch (err) {
      setError(new Error("An unexpected error occurred. Please try again."));
      console.error("Sign in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    // Use react-hook-form for email validation for forgot password
    const emailValidationResult = loginSchema.pick({ email: true }).safeParse({ email: errors.email?.message || "" });
    if (!emailValidationResult.success) {
      setFormError("email", {
        type: "manual",
        message: emailValidationResult.error.errors[0].message,
      });
      setError(new Error(emailValidationResult.error.errors[0].message));
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        emailValidationResult.data.email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        },
      );

      if (resetError) {
        setError(resetError);
        setFormError("email", {
          type: "manual",
          message: resetError.message,
        });
        return;
      }

      setSuccess(
        "Password reset email sent! Check your inbox for further instructions.",
      );
      setShowForgotPassword(false);
    } catch (err) {
      setError(new Error("An unexpected error occurred. Please try again."));
      console.error("Password reset error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <form
        onSubmit={(event) => void handleSubmit(handleForgotPassword)(event)}
        className="space-y-4"
      >
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-white">Reset Password</h3>
          <p className="text-sm text-gray-300">
            Enter your email address and we&apos;ll send you a reset link
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="reset-email" className="text-white">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="reset-email"
              type="email"
              placeholder="Enter your email"
              {...register("email")}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              required
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            type="submit"
            className="flex-1 bg-purple-600 hover:bg-purple-700"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Link
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowForgotPassword(false);
              setError(null);
              setSuccess(null);
              clearErrors(); // Clear react-hook-form errors
            }}
            disabled={isLoading}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      {/* Social Sign In */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
          disabled={isLoading}
          onClick={() => void handleSocialSignIn("github")}
        >
          <Github className="mr-2 h-4 w-4" />
          Continue with GitHub
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
          disabled={isLoading}
          onClick={() => void handleSocialSignIn("google")}
        >
          <Chrome className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full border-white/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-transparent px-2 text-gray-400">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Email Sign In Form */}
      <form onSubmit={(event) => void handleSubmit(handleSignIn)(event)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register("email")}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              {...register("password")}
              className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-sm">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => void setShowForgotPassword(true)}
            className="text-sm text-purple-400 hover:text-purple-300 font-medium"
            disabled={isLoading}
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>
    </div>
  );
}
