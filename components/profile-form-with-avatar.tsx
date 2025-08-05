"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUpload } from "@/components/file-upload";
import { useAuth } from "@/contexts/auth-context";
import { uploadFile } from "@/lib/blob";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/lib/validators";
import type { z } from "zod";
import { User } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileFormWithAvatar() {
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      username: "",
      avatar: "",
    },
    mode: "onBlur", // Enable real-time validation on blur
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.full_name || "",
        username: profile.username || "",
        avatar: profile.avatar_url || "",
      });
    }
  }, [profile, form]);

  const handleAvatarUpload = async (file: File) => {
    if (!user) {
      return { success: false, error: new Error("User not authenticated.") };
    }

    try {
      const result = await uploadFile(file, `avatars/${user.id}`);
      if (result.success && result.url) {
        form.setValue("avatar", result.url, {
          shouldDirty: true,
          shouldValidate: true,
        });
        toast(
          "Avatar uploaded successfully! Click Save Changes to apply.",
          "success",
        );
        return { success: true, url: result.url };
      } else {
        throw new Error(result.error?.message || "Failed to upload avatar.");
      }
    } catch (err: unknown) {
      const errorMessageText =
        err instanceof Error ? err.message : "Failed to upload avatar.";
      toast(errorMessageText, "error");
      return {
        success: false,
        error:
          err instanceof Error ? err : new Error("An unknown error occurred."),
      };
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    try {
      await updateProfile({
        full_name: data.fullName,
        username: data.username,
        avatar_url: data.avatar,
      });
      toast("Profile updated successfully.", "success");
    } catch (err: unknown) {
      const errorMessageText =
        err instanceof Error ? err.message : "Failed to update profile.";
      toast(errorMessageText, "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Loading profile data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Spinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage your public profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-slate-500">
            Please log in to manage your profile.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Manage your public profile.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={void form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <Image
                  src={form.watch("avatar") || "/placeholder-user.svg"}
                  alt={form.watch("fullName") || "User Avatar"}
                  width={96} // Corresponds to h-24 w-24 (96px)
                  height={96}
                  className="rounded-full object-cover"
                />
                <AvatarFallback>
                  {form.watch("fullName") ? (
                    form.watch("fullName").charAt(0)
                  ) : (
                    <User className="h-12 w-12" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <FileUpload
                  onUpload={handleAvatarUpload}
                  accept="image/*"
                  buttonText="Change Avatar"
                  disabled={isSaving}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      disabled={isSaving}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="johndoe"
                      disabled={isSaving}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800"
              disabled={isSaving || !form.formState.isDirty}
            >
              {isSaving ? <Spinner size="sm" /> : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
