"use client";

import React from "react";
import {} from "@/components/ui/card";

interface WelcomeWidgetProps {
  userName?: string;
}

export function WelcomeWidget({ userName }: WelcomeWidgetProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-lg font-semibold">
        Welcome{userName ? `, ${userName}` : ""} to your Dashboard!
      </p>
    </div>
  );
}
