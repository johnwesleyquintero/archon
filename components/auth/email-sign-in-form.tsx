"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { loginSchema, signupSchema } from "@/lib/validators";
import { handleAuthAction as handleAuthActionType } from "@/lib/auth/actions"; // Import only for type definition

type FormInputs = z.infer<typeof loginSchema> | z.infer<typeof signupSchema>;

interface EmailSignInFormProps {
  mode?: "signIn" | "signUp";
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onForgotPasswordClick: () => void;
  onSignUpSuccess?: () => void;
  handleAuthAction: typeof handleAuthActionType; // Add the new prop
}

export function EmailSignInForm({
  mode = "signIn",
  isLoading,
  setIsLoading,
  onForgotPasswordClick,
  onSignUpSuccess,
  handleAuthAction, // Destructure the prop
}: EmailSignInFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    clearErrors,
  } = useForm<FormInputs>({
    resolver: zodResolver(mode === "signIn" ? loginSchema : signupSchema),
  });

  // Explicitly type errors for signup schema when in signUp mode
  const signUpErrors = errors as FieldErrors<z.infer<typeof signupSchema>>;

  const handleAuthActionClient = async (data: FormInputs) => {
    setIsLoading(true);
    clearErrors();

    const result = await handleAuthAction(data, mode); // Use the prop

    if (result.success) {
      if (mode === "signIn") {
        router.push("/dashboard");
      } else {
        if (onSignUpSuccess) {
          onSignUpSuccess();
        } else {
          toast({
            title: "Success!",
            description: "Please check your email to confirm your account.",
          });
          router.refresh();
        }
      }
    } else {
      const errorMessage = result.error || "An unexpected error occurred.";
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: errorMessage,
      });
      setFormError("root", { message: errorMessage });
    }
    setIsLoading(false);
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(handleAuthActionClient)(event)}
      className="space-y-4"
    >
      {errors.root && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register("email")}
            className="pl-10"
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
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            {...register("password")}
            className="pl-10 pr-10"
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

      {mode === "signUp" && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              {...register("confirmPassword")}
              className="pl-10 pr-10"
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {signUpErrors.confirmPassword && (
            <p className="text-red-400 text-sm">
              {signUpErrors.confirmPassword.message}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={onForgotPasswordClick}
          className="text-sm text-primary hover:underline font-medium"
          disabled={isLoading}
        >
          Forgot password?
        </button>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {mode === "signIn" ? "Sign In" : "Sign Up"}
      </Button>
    </form>
  );
}
