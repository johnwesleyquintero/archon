"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { Separator } from "@/components/ui/separator";

import { EmailSignInForm } from "./email-sign-in-form";
import { ForgotPasswordForm } from "./forgot-password-form";
import { SocialSignInButtons } from "./social-sign-in-buttons";
import { handleAuthAction } from "@/lib/auth/actions";

interface AuthFormProps {
  mode?: "signIn" | "signUp";
}

export function AuthForm({ mode = "signIn" }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const router = useRouter();

  const handleSignUpSuccess = () => {
    router.push("/auth/verify-email");
  };

  if (showForgotPassword) {
    return <ForgotPasswordForm />;
  }

  return (
    <div className="space-y-6">
      <SocialSignInButtons isLoading={isLoading} setIsLoading={setIsLoading} />

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

      <EmailSignInForm
        mode={mode}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        onForgotPasswordClick={() => setShowForgotPassword(true)}
        onSignUpSuccess={handleSignUpSuccess}
      />
    </div>
  );
}
