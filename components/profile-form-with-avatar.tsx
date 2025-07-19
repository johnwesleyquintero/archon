"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2 } from "lucide-react"
import { uploadFile } from "@/lib/blob"

interface ProfileData {
  fullName: string
  username: string
  email: string
  avatar: string
}

export function ProfileFormWithAvatar() {
  const [originalData] = useState<ProfileData>({
    fullName: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    avatar: "/placeholder.svg?height=80&width=80",
  })

  const [formData, setFormData] = useState<ProfileData>(originalData)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const dataChanged =
      formData.fullName !== originalData.fullName ||
      formData.username !== originalData.username ||
      formData.avatar !== originalData.avatar
    setHasChanges(dataChanged)
  }, [formData, originalData])

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    // In a real app, you would update the originalData here after successful save
    console.log("Profile updated:", formData)
  }

  const handleReset = () => {
    setFormData(originalData)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file is an image
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Maximum size is 2MB.")
      return
    }

    setIsUploading(true)

    try {
      // Upload to Vercel Blob
      const result = await uploadFile(file, "avatars")

      if (result.success) {
        handleInputChange("avatar", result.url)
      } else {
        alert("Failed to upload image. Please try again.")
      }
    } catch (error) {
      console.error("Error uploading avatar:", error)
      alert("An error occurred while uploading your avatar.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-600 mt-1">Manage your personal information and profile settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your profile information. This information will be visible to other users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.avatar || "/placeholder.svg"} alt="Profile picture" />
                <AvatarFallback className="text-lg">
                  {formData.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {isUploading && (
                <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={() => document.getElementById("avatar-upload")?.click()}
                  disabled={isUploading}
                >
                  <Camera className="h-4 w-4" />
                  {isUploading ? "Uploading..." : "Change Photo"}
                </Button>
              </div>
              <p className="text-xs text-slate-500">JPG, GIF or PNG. Max size of 2MB.</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                Full Name
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="Enter your full name"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                Username
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="Enter your username"
                className="h-10"
              />
              <p className="text-xs text-slate-500">This is your public username. It can be changed at any time.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="h-10 bg-slate-50 text-slate-500"
              />
              <p className="text-xs text-slate-500">
                Your email address cannot be changed. Contact support if you need to update it.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="bg-slate-900 hover:bg-slate-800">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={!hasChanges || isSaving}>
              Reset
            </Button>
          </div>

          {hasChanges && (
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
              You have unsaved changes. Don't forget to save your updates.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
