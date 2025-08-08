"use client";

import type React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";
import { QuickAddTaskModal } from "./custom/quick-add-task-modal";
import { QuickAddGoalModal } from "./custom/quick-add-goal-modal";
import { QuickAddJournalModal } from "./custom/quick-add-journal-modal";
import { CommandMenu } from "./custom/command-menu";
import { useCommandMenu } from "@/lib/state/use-command-menu";
import { useEffect } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isCollapsed: isSidebarCollapsed, toggleSidebar } = useSidebar(); // Use the hook
  const { open } = useCommandMenu();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        open();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

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
      <QuickAddTaskModal />
      <QuickAddGoalModal />
      <QuickAddJournalModal />
      <CommandMenu />
    </div>
  );
}
