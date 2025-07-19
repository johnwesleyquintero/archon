"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Key, Trash2 } from "lucide-react"

export function AccountSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account</h1>
        <p className="text-slate-600 mt-1">Manage your account security and preferences.</p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security settings and two-factor authentication.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900">Two-Factor Authentication</h4>
                <p className="text-sm text-slate-600">Add an extra layer of security to your account</p>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Password
            </CardTitle>
            <CardDescription>Change your password to keep your account secure.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Change Password</Button>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Permanently delete your account and all associated data.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
