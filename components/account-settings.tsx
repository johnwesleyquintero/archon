"use client";

import { AppearanceSettings } from "@/components/appearance-settings";
import { EmptyState } from "@/components/empty-state";
import { ProfileFormWithAvatar } from "@/components/profile-form-with-avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";

export function AccountSettings() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your profile, preferences, and account details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-slate-500">
            Please log in to view your account settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your profile, preferences, and account details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 h-10">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-4">
            <ProfileFormWithAvatar />
          </TabsContent>
          <TabsContent value="appearance" className="mt-4">
            <AppearanceSettings />
          </TabsContent>
          <TabsContent value="security" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Change your password and manage security preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="Security Features Coming Soon"
                  description="Password change and two-factor authentication options will be available here in a future update."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
