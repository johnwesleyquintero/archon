"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validators";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";

type LoginFormInputs = z.infer<typeof loginSchema>;

interface EmailSignInFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onForgotPasswordClick: () => void;
}

export function EmailSignInForm({
  isLoading,
  setIsLoading,
  onForgotPasswordClick,
}: EmailSignInFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    clearErrors,
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const handleSignIn = async (data: LoginFormInputs) => {
    setIsLoading(true);
    clearErrors();

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
          toast({
            variant: "destructive",
            title: "Sign In Error",
            description:
              "Invalid email or password. Please check your credentials and try again.",
          });
        } else if (errorMessage.includes("Email not confirmed")) {
          setFormError("email", {
            type: "manual",
            message:
              "Please check your email and click the confirmation link before signing in.",
          });
          toast({
            variant: "destructive",
            title: "Sign In Error",
            description:
              "Please check your email and click the confirmation link before signing in.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Sign In Error",
            description: signInError.message,
          });
        }
        return;
      }

      router.refresh();
    } catch (err) {
      console.error("Sign in error:", err);
      toast({
        variant: "destructive",
        title: "Sign In Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(handleSignIn)(event)}
      className="space-y-4"
    >
      {errors.root && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.root.message}</AlertDescription>
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
          onClick={onForgotPasswordClick}
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
  );
}
