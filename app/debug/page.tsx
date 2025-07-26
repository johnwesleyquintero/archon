"use client";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function DebugPage() {
  const { user, profile, loading, error, refreshProfile } = useAuth(); // Changed isLoading to loading, and refetchProfile to refreshProfile
  const [isRefetching, setIsRefetching] = useState(false);

  const handleRefetchProfile = async () => {
    setIsRefetching(true);
    await refreshProfile(); // Use refreshProfile
    setIsRefetching(false);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Debug Information</h1>

      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Loading:</strong> {loading ? "Yes" : "No"}
          </p>
          <p>
            <strong>User ID:</strong> {user?.id || "N/A"}
          </p>
          <p>
            <strong>User Email:</strong> {user?.email || "N/A"}
          </p>
          <p>
            <strong>Auth Error:</strong> {error?.message || "None"}
          </p>
          <Button
            onClick={() => {
              void handleRefetchProfile();
            }}
            disabled={isRefetching}
          >
            {isRefetching ? <Spinner size="sm" /> : "Refetch Profile"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Profile Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Full Name:</strong> {profile?.full_name || "N/A"}
          </p>
          <p>
            <strong>Username:</strong> {profile?.username || "N/A"}
          </p>
          <p>
            <strong>Avatar URL:</strong> {profile?.avatar_url || "N/A"}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {user?.created_at
              ? new Date(user.created_at).toLocaleString()
              : "N/A"}
          </p>
          <p>
            <strong>Updated At:</strong>{" "}
            {profile?.updated_at
              ? new Date(profile.updated_at).toLocaleString()
              : "N/A"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables (Public)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>{" "}
            {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not Set"}
          </p>
          <p>
            <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>{" "}
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not Set"}
          </p>
          <p>
            <strong>NEXT_PUBLIC_VERCEL_URL:</strong>{" "}
            {process.env.NEXT_PUBLIC_VERCEL_URL || "Not Set"}
          </p>
          <p>
            <strong>NEXT_PUBLIC_VERCEL_ENV:</strong>{" "}
            {process.env.NEXT_PUBLIC_VERCEL_ENV || "Not Set"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
