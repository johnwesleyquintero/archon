"use client";

import { useEffect, useState } from "react";

import { useTheme } from "next-themes";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect to ensure theme is only read on client-side after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Render nothing on the server or until mounted on client
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize the look and feel of the dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="theme-select">Theme</Label>
          <RadioGroup
            value={theme}
            onValueChange={(value) => setTheme(value)}
            className="flex space-x-4"
            id="theme-select"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="light-theme" />
              <Label htmlFor="light-theme">Light</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="dark-theme" />
              <Label htmlFor="dark-theme">Dark</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="system-theme" />
              <Label htmlFor="system-theme">System</Label>
            </div>
          </RadioGroup>
        </div>
        {/* Add more appearance settings here, e.g., primary color picker */}
      </CardContent>
    </Card>
  );
}
