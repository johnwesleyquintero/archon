// This file was previously abbreviated. Here is its full content.
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // useEffect to ensure theme is only read on client-side after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null // Render nothing on the server or until mounted on client
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Appearance</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Customize how Archon looks and feels for you.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Choose how Archon looks to you. Select a single theme, or sync with your system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={theme}
            onValueChange={(value: "light" | "dark" | "system") => setTheme(value)}
            className="grid grid-cols-3 gap-4"
          >
            <div className="flex items-center space-x-2 border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                <Sun className="h-4 w-4" />
                Light
              </Label>
            </div>
            <div className="flex items-center space-x-2 border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                <Moon className="h-4 w-4" />
                Dark
              </Label>
            </div>
            <div className="flex items-center space-x-2 border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer">
                <Monitor className="h-4 w-4" />
                System
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  )
}
