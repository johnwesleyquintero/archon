// This file is now deprecated and replaced by profile-form-with-avatar.tsx
// Keeping it here for reference if needed, but it's not actively used.
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"

export function ProfileForm() {
  const { user, profile, updateProfile, isLoading } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [username, setUsername] = useState(profile?.username || "")
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "")
      setUsername(profile.username || "")
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(null)

    if (!user) {
      setSaveError("User not authenticated.")
      setIsSaving(false)
      return
    }

    try {
      await updateProfile({ full_name: fullName, username: username })
      setSaveSuccess("Profile updated successfully!")
    } catch (err: any) {
      setSaveError(err.message || "Failed to update profile.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Loading profile data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <p>Loading...</p>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              disabled={isSaving}
            />
          </div>
          {saveError && <p className="text-sm text-red-500">{saveError}</p>}
          {saveSuccess && <p className="text-sm text-green-600">{saveSuccess}</p>}
          <Button type="submit" className="bg-slate-900 hover:bg-slate-800" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
