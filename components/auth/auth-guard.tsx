"use client";

import type React from "react";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user, redirect to login.
    // The AuthContext handles setting user to null and clearing errors on sign-out.
    // Any error that results in no user should lead to login.
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    // Display a generic error message for any authentication error
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
