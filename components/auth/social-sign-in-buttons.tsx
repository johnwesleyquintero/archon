"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface SocialSignInButtonsProps {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SocialSignInButtons({
  isLoading,
  setIsLoading,
}: SocialSignInButtonsProps) {
  const supabase = createClient();

  const handleOAuthSignIn = async (provider: "github" | "google") => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    // setIsLoading(false); // This line might not be reached due to redirect
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isLoading}
        onClick={() => void handleOAuthSignIn("github")}
      >
        Continue with GitHub
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isLoading}
        onClick={() => void handleOAuthSignIn("google")}
      >
        Continue with Google
      </Button>
    </div>
  );
}
