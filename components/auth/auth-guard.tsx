"use client";

import type React from "react";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { AuthSessionMissingError } from "@supabase/supabase-js"; // Import AuthSessionMissingError

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading, no user, and either no error or a specific AuthSessionMissingError, redirect to login
    if (
      !loading &&
      !user &&
      (!error || error instanceof AuthSessionMissingError)
    ) {
      router.push("/login");
    }
  }, [user, loading, error, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !(error instanceof AuthSessionMissingError)) {
    // Only render a generic error message for non-AuthSessionMissingError errors
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 text-red-700 p-4">
        <p>Authentication Error: {error.message}</p>
      </div>
    );
  }

  if (!user) {
    // This case should ideally be handled by the useEffect redirect,
    // but as a fallback, return null or a minimal loading state.
    return null;
  }

  return <>{children}</>;
}
