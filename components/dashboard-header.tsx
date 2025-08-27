"use client";

import { PlusCircle } from "lucide-react";

import { SearchBar } from "@/components/dashboard/controls/search-bar";
import { NotificationsButton } from "@/components/dashboard/header/notifications-button";
import { UserMenu } from "@/components/dashboard/header/user-menu";
import { MobileNavSheet } from "@/components/dashboard/mobile-nav-sheet";
import { Button } from "@/components/ui/button";
import { useGlobalQuickAdd } from "@/lib/state/use-global-quick-add";

export function DashboardHeader() {
  const { open } = useGlobalQuickAdd();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 sm:static sm:px-6">
      <MobileNavSheet />

      <SearchBar role="search" />
      <Button
        variant="default"
        size="sm"
        className="ml-auto"
        onClick={() => open("task")}
        aria-label="Quick add task"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Quick Add Task
      </Button>
      <NotificationsButton />
      <UserMenu />
    </header>
  );
}
