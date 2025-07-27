"use client";

import type React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar"; // Import the new hook

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isCollapsed: isSidebarCollapsed, toggleSidebar } = useSidebar(); // Use the hook

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr]">
      <AppSidebar isCollapsed={isSidebarCollapsed} />
      <div className="flex flex-col">
        <DashboardHeader onToggleSidebar={toggleSidebar} />
        <main
          className={cn(
            "flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6",
            isSidebarCollapsed ? "md:pl-4" : "md:pl-6",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
