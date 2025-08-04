"use client";

import { Menu } from "lucide-react";

import { MobileNavSheet } from "@/components/dashboard/mobile-nav-sheet";
import { NotificationsButton } from "@/components/dashboard/header/notifications-button";
import { SearchBar } from "@/components/dashboard/controls/search-bar";
import { UserMenu } from "@/components/dashboard/header/user-menu";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
}

export function DashboardHeader({ onToggleSidebar }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 sm:static sm:px-6">
      <MobileNavSheet />
      <Button
        size="icon"
        variant="ghost"
        className="hidden sm:flex"
        onClick={onToggleSidebar}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
      <SearchBar role="search" />
      <NotificationsButton />
      <UserMenu />
    </header>
  );
}
