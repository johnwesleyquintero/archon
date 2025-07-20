"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
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
import { useToast } from "@/components/ui/use-toast";

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileFormWithAvatar() {
  const { user, profile, updateProfile, isLoading: authLoading } = useAuth();
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
        toast({
          title: "Success!",
          description:
            "Avatar uploaded successfully! Click Save Changes to apply.",
        });
        return { success: true, url: result.url };
      } else {
        throw new Error(result.error?.message || "Failed to upload avatar.");
      }
    } catch (err: unknown) {
      let errorMessageText = "Failed to upload avatar.";
      let errorToReturn: Error | undefined = undefined;
      if (err instanceof Error) {
        errorMessageText = err.message;
        errorToReturn = err;
      } else if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message: unknown }).message === "string"
      ) {
        errorMessageText = (err as { message: string }).message;
        errorToReturn = new Error((err as { message: string }).message);
      } else {
        errorToReturn = new Error("An unknown error occurred.");
      }
      toast({
        title: "Error",
        description: errorMessageText,
        variant: "destructive",
      });
      return { success: false, error: errorToReturn };
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
      toast({
        title: "Success!",
        description: "Profile updated successfully.",
      });
    } catch (err: unknown) {
      let errorMessageText = "Failed to update profile.";
      if (err instanceof Error) {
        errorMessageText = err.message;
      } else if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message: unknown }).message === "string"
      ) {
        errorMessageText = (err as { message: string }).message;
      }
      toast({
        title: "Error",
        description: errorMessageText,
        variant: "destructive",
      });
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
        <form onSubmit={void form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={form.watch("avatar") || "/placeholder-user.png"}
                alt={form.watch("fullName") || "User Avatar"}
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
                  <Input placeholder="johndoe" disabled={isSaving} {...field} />
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
      </CardContent>
    </Card>
  );
}
