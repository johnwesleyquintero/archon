"use client"

import { Button } from "@/components/ui/button"
import { User, Settings, Palette } from "lucide-react"
import { cn } from "@/lib/utils"

interface SettingsNavProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const navItems = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
  },
  {
    id: "account",
    label: "Account",
    icon: Settings,
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
  },
]

export function SettingsNav({ activeSection, onSectionChange }: SettingsNavProps) {
  return (
    <nav className="space-y-2">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Settings</h2>
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "w-full justify-start h-10 px-3 text-sm font-medium transition-colors",
              activeSection === item.id
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
            )}
            onClick={() => onSectionChange(item.id)}
          >
            <Icon className="mr-3 h-4 w-4" />
            {item.label}
          </Button>
        )
      })}
    </nav>
  )
}
