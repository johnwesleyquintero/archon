"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SettingsNav } from "@/components/settings-nav"
import { ProfileForm } from "@/components/profile-form"
import { AccountSettings } from "@/components/account-settings"
import { AppearanceSettings } from "@/components/appearance-settings"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile")

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileForm />
      case "account":
        return <AccountSettings />
      case "appearance":
        return <AppearanceSettings />
      default:
        return <ProfileForm />
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Settings</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Left Column - Navigation */}
            <div className="md:col-span-1">
              <div className="sticky top-4">
                <SettingsNav activeSection={activeSection} onSectionChange={setActiveSection} />
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="md:col-span-3">{renderContent()}</div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
