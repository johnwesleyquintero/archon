"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Target,
  ListTodo,
  BookOpen,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArchonLogoSVG } from "@/components/archon-logo-svg";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  isCollapsed: boolean;
}

export function AppSidebar({ isCollapsed }: AppSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/goals", icon: Target, label: "Goals" },
    { href: "/tasks", icon: ListTodo, label: "Tasks" },
    { href: "/journal", icon: BookOpen, label: "Journal" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/login");
    setIsSigningOut(false);
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-slate-50 transition-all duration-200",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-center border-b px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <ArchonLogoSVG
            className={cn(
              "h-6 w-6 transition-all duration-200",
              isCollapsed ? "mr-0" : "mr-2",
            )}
          />
          {!isCollapsed && <span className="text-lg">Archon</span>}
        </Link>
      </div>
      <nav className="flex-1 grid items-start gap-2 p-4">
        <TooltipProvider>
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-900 transition-all hover:bg-slate-100",
                    pathname.startsWith(item.href)
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600",
                    isCollapsed ? "justify-center" : "",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && item.label}
                </Link>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">{item.label}</TooltipContent>
              )}
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
      <div className="mt-auto p-4 border-t border-slate-200">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-900 transition-all hover:bg-slate-100",
                  pathname === "/settings"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600",
                  isCollapsed ? "justify-center" : "",
                )}
              >
                <User className="h-5 w-5" />
                {!isCollapsed && "Profile"}
              </Link>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Profile</TooltipContent>
            )}
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-slate-900 transition-all hover:bg-slate-100 mt-2",
                  isCollapsed ? "justify-center" : "",
                )}
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                <LogOut className="h-5 w-5" />
                {!isCollapsed && (isSigningOut ? "Signing out..." : "Sign Out")}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Sign Out</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}
