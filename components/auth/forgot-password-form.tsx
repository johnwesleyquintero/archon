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
import { forgotPassword } from "@/app/auth/actions"; // Import the server action
import { loginSchema } from "@/lib/validators";

type LoginFormInputs = z.infer<typeof loginSchema>;

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showForm, setShowForm] = React.useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    clearErrors,
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const handleForgotPassword = async (data: LoginFormInputs) => {
    setIsLoading(true);
    clearErrors();

    try {
      const formData = new FormData();
      formData.append("email", data.email);

      const result = await forgotPassword(formData);

      if (!result.success) {
        setFormError("email", {
          type: "manual",
          message: result.message,
        });
        toast({
          variant: "destructive",
          title: "Password Reset Error",
          description: result.message,
        });
        return;
      }

      toast({
        title: "Password Reset Email Sent",
        description: result.message,
      });
      setShowForm(false); // Hide the form on success
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

  return showForm ? (
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
          onClick={() => setShowForm(false)} // Allow going back to sign-in form
          disabled={isLoading}
          className="border-white/20 text-white hover:bg-white/10"
        >
          Cancel
        </Button>
      </div>
    </form>
  ) : (
    <div className="text-center space-y-4">
      <h3 className="text-lg font-semibold text-white">Email Sent!</h3>
      <p className="text-sm text-gray-300">
        Please check your inbox for instructions to reset your password.
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowForm(true)}
        className="border-white/20 text-white hover:bg-white/10"
      >
        Go Back
      </Button>
    </div>
  );
}
