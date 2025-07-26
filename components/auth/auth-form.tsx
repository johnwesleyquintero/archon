"use client";

import type React from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useAuth } from "@/contexts/auth-context";

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const { signIn, resetPassword } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors when user starts typing
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.email) {
      setError(new Error("Email is required"));
      return false;
    }
    if (!formData.email.includes("@")) {
      setError(new Error("Please enter a valid email address"));
      return false;
    }
    if (!formData.password) {
      setError(new Error("Password is required"));
      return false;
    }
    if (formData.password.length < 6) {
      setError(new Error("Password must be at least 6 characters"));
      return false;
    }
    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error: signInError } = await signIn(
        formData.email,
        formData.password,
      );

      if (signInError) {
        const errorMessage = signInError.message;

        if (errorMessage.includes("Invalid login credentials")) {
          setError(
            new Error(
              "Invalid email or password. Please check your credentials and try again.",
            ),
          );
        } else if (errorMessage.includes("Email not confirmed")) {
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

      // Success - redirect will happen automatically via auth state change
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(new Error("An unexpected error occurred. Please try again."));
      console.error("Sign in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError(new Error("Please enter your email address"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: resetError } = await resetPassword(formData.email);

      if (resetError) {
        setError(resetError);
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
        onSubmit={(e) => void handleForgotPassword(e)}
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
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              required
              disabled={isLoading}
            />
          </div>
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
        >
          <Github className="mr-2 h-4 w-4" />
          Continue with GitHub
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
          disabled={isLoading}
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
      <form onSubmit={(e) => void handleSignIn(e)} className="space-y-4">
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
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
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
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              disabled={isLoading}
              className="border-white/20"
            />
            <Label htmlFor="remember" className="text-sm text-gray-300">
              Remember me
            </Label>
          </div>
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
