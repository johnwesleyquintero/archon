"use client";

import React from "react";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";

interface SocialSignInButtonsProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function SocialSignInButtons({
  isLoading,
  setIsLoading,
}: SocialSignInButtonsProps) {
  const supabase = createClient();
  const { toast } = useToast();

  const handleSocialSignIn = async (provider: "github" | "google") => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) {
        toast({
          variant: "destructive",
          title: "Sign In Error",
          description: error.message,
        });
      }
    } catch (err) {
      console.error("Social sign in error:", err);
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
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
        disabled={isLoading}
        onClick={() => void handleSocialSignIn("github")}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Continue with GitHub
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
        disabled={isLoading}
        onClick={() => void handleSocialSignIn("google")}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Continue with Google
      </Button>
    </div>
  );
}
