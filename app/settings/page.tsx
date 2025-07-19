import { AccountSettings } from "@/components/account-settings"
import { SettingsNav } from "@/components/settings-nav"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function SettingsPage() {
  const settingsNavItems = [
    { href: "/settings", label: "Profile" },
    { href: "/settings?tab=appearance", label: "Appearance" },
    { href: "/settings?tab=security", label: "Security" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
        <Card className="hidden md:block">
          <CardHeader>
            <CardTitle className="text-lg">Navigation</CardTitle>
            <CardDescription>Manage your settings categories.</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsNav items={settingsNavItems} />
          </CardContent>
        </Card>
        <AccountSettings />
      </div>
    </div>
  )
}
