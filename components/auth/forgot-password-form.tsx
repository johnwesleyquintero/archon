"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Mail } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validators";

type LoginFormInputs = z.infer<typeof loginSchema>;

interface ForgotPasswordFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onCancel: () => void;
}

export function ForgotPasswordForm({
  isLoading,
  setIsLoading,
  onCancel,
}: ForgotPasswordFormProps) {
  const supabase = createClient();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    clearErrors,
    getValues,
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const handleForgotPassword = async () => {
    const email = getValues("email");
    const emailValidationResult = loginSchema
      .pick({ email: true })
      .safeParse({ email });

    if (!emailValidationResult.success) {
      setFormError("email", {
        type: "manual",
        message: emailValidationResult.error.issues[0].message,
      });
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: emailValidationResult.error.issues[0].message,
      });
      return;
    }

    setIsLoading(true);
    clearErrors();

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        emailValidationResult.data.email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        },
      );

      if (resetError) {
        setFormError("email", {
          type: "manual",
          message: resetError.message,
        });
        toast({
          variant: "destructive",
          title: "Password Reset Error",
          description: resetError.message,
        });
        return;
      }

      toast({
        title: "Password Reset Email Sent",
        description: "Check your inbox for further instructions.",
      });
      onCancel(); // Go back to sign-in form on success
    } catch (err) {
      console.error("Password reset error:", err);
      toast({
        variant: "destructive",
        title: "Password Reset Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(handleForgotPassword)(event)}
      className="space-y-4"
    >
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white">Reset Password</h3>
        <p className="text-sm text-gray-300">
          Enter your email address and we'll send you a reset link
        </p>
      </div>

      {errors.root && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.root.message}</AlertDescription>
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
          onClick={onCancel}
          disabled={isLoading}
          className="border-white/20 text-white hover:bg-white/10"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
