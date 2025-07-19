"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"

interface ProfileData {
  fullName: string
  username: string
  email: string
  avatar: string
}

export function ProfileForm() {
  const [originalData] = useState<ProfileData>({
    fullName: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    avatar: "/placeholder.svg?height=80&width=80",
  })

  const [formData, setFormData] = useState<ProfileData>(originalData)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const dataChanged = formData.fullName !== originalData.fullName || formData.username !== originalData.username
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
            <Avatar className="h-20 w-20">
              <AvatarImage src={formData.avatar || "/placeholder.svg"} alt="Profile picture" />
              <AvatarFallback className="text-lg">
                {formData.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Camera className="h-4 w-4" />
                Change Photo
              </Button>
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
