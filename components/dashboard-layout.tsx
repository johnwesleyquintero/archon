"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";

import type React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isCollapsed: isSidebarCollapsed } = useSidebar();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr]">
      <AppSidebar />
      <div className="flex flex-col">
        <DashboardHeader />
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
