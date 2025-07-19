"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/file-upload"
import { useAuth } from "@/contexts/auth-context"
import { uploadFile } from "@/lib/blob"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { profileSchema } from "@/lib/validators"
import type { z } from "zod"
import { User } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

type ProfileFormValues = z.infer<typeof profileSchema>

export function ProfileFormWithAvatar() {
  const { user, profile, updateProfile, isLoading: authLoading } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      username: "",
      avatar: "",
    },
  })

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.full_name || "",
        username: profile.username || "",
        avatar: profile.avatar_url || "",
      })
    }
  }, [profile, form])

  const handleAvatarUpload = async (file: File) => {
    if (!user) {
      return { success: false, error: new Error("User not authenticated.") }
    }

    try {
      const result = await uploadFile(file, `avatars/${user.id}`)
      if (result.success && result.url) {
        form.setValue("avatar", result.url, { shouldDirty: true, shouldValidate: true })
        setSaveSuccess("Avatar uploaded successfully! Click Save Changes to apply.")
        setSaveError(null)
        return { success: true, url: result.url }
      } else {
        throw new Error(result.error?.message || "Failed to upload avatar.")
      }
    } catch (error: any) {
      setSaveError(error.message || "Failed to upload avatar.")
      setSaveSuccess(null)
      return { success: false, error }
    }
  }

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(null)
    try {
      await updateProfile({
        full_name: data.fullName,
        username: data.username,
        avatar_url: data.avatar,
      })
      setSaveSuccess("Profile updated successfully!")
    } catch (err: any) {
      setSaveError(err.message || "Failed to update profile.")
    } finally {
      setIsSaving(false)
    }
  }

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
    )
  }

  if (!user) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage your public profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-slate-500">Please log in to manage your profile.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Manage your public profile.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={form.watch("avatar") || "/placeholder-user.png"}
                alt={form.watch("fullName") || "User Avatar"}
              />
              <AvatarFallback>
                {form.watch("fullName") ? form.watch("fullName").charAt(0) : <User className="h-12 w-12" />}
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

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" {...form.register("fullName")} placeholder="John Doe" disabled={isSaving} />
            {form.formState.errors.fullName && (
              <p className="text-sm text-red-500">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...form.register("username")} placeholder="johndoe" disabled={isSaving} />
            {form.formState.errors.username && (
              <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
            )}
          </div>

          {saveError && <p className="text-sm text-red-500">{saveError}</p>}
          {saveSuccess && <p className="text-sm text-green-600">{saveSuccess}</p>}

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
  )
}
