"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  Home,
  Target,
  ListTodo,
  BookOpen,
  Settings,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ArchonLogoSVG } from "@/components/archon-logo-svg";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
}

export function DashboardHeader({ onToggleSidebar }: DashboardHeaderProps) {
  const { user, signOut, profile } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/login");
    setIsSigningOut(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 sm:static sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            className="sm:hidden bg-transparent"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Navigation Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <ArchonLogoSVG className="h-6 w-6" />
              Archon
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-4 px-2.5 text-slate-600 hover:text-slate-900"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/goals"
              className="flex items-center gap-4 px-2.5 text-slate-600 hover:text-slate-900"
            >
              <Target className="h-5 w-5" />
              Goals
            </Link>
            <Link
              href="/tasks"
              className="flex items-center gap-4 px-2.5 text-slate-600 hover:text-slate-900"
            >
              <ListTodo className="h-5 w-5" />
              Tasks
            </Link>
            <Link
              href="/journal"
              className="flex items-center gap-4 px-2.5 text-slate-600 hover:text-slate-900"
            >
              <BookOpen className="h-5 w-5" />
              Journal
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-4 px-2.5 text-slate-600 hover:text-slate-900"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
            <Button
              variant="ghost"
              className="flex items-center gap-4 px-2.5 text-slate-600 hover:text-slate-900 justify-start"
              onClick={void handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="h-5 w-5" />
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
      <Button
        size="icon"
        variant="ghost"
        className="hidden sm:flex"
        onClick={onToggleSidebar}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-slate-100 pl-8 md:w-[200px] lg:w-[336px]"
        />
      </div>
      <Button size="icon" variant="ghost" className="relative">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Notifications</span>
        <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
          3
        </span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={profile?.avatar_url || "/placeholder-user.png"}
                alt={profile?.full_name || "User"}
              />
              <AvatarFallback>
                {profile?.full_name ? (
                  profile.full_name.charAt(0)
                ) : (
                  <User className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            {profile?.full_name || user?.email || "My Account"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={void handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? "Signing out..." : "Logout"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
