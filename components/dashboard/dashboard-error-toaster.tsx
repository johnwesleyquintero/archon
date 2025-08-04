"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface DashboardErrorToasterProps {
  goalsError: string | null;
  dashboardSettingsError: string | null;
}

export function DashboardErrorToaster({
  goalsError,
  dashboardSettingsError,
}: DashboardErrorToasterProps) {
  const { toast } = useToast();

  useEffect(() => {
    if (goalsError) {
      toast({
        title: "Error loading goals",
        description: goalsError,
        variant: "destructive",
      });
    }
  }, [goalsError, toast]);

  useEffect(() => {
    if (dashboardSettingsError) {
      toast({
        title: "Error loading dashboard settings",
        description: dashboardSettingsError,
        variant: "destructive",
      });
    }
  }, [dashboardSettingsError, toast]);

  return null; // This component does not render anything directly
}
