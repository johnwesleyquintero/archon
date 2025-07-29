"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { LogOut } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import {
  NAV_ITEMS,
  PROFILE_NAV_ITEM,
  SIGN_OUT_LABEL,
  SIGNING_OUT_LABEL,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

import Logo from "./logo";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface AppSidebarProps {
  isCollapsed?: boolean;
}

export function AppSidebar({ isCollapsed = false }: AppSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/"); // Redirect to root, let AuthGuard handle further redirection
    setIsSigningOut(false);
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-sidebar-background transition-all duration-200",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-center border-b px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
          aria-label="Archon Dashboard"
        >
          <Logo
            className={cn(
              "h-6 w-6 transition-all duration-200",
              isCollapsed ? "mr-0" : "mr-2",
            )}
          />
          {!isCollapsed && <span className="text-lg">Archon</span>}
        </Link>
      </div>
      <nav className="flex-1 grid items-start gap-2 p-4">
        {NAV_ITEMS.map((item) => (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent",
                  pathname.startsWith(item.href)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground",
                  isCollapsed ? "justify-center" : "",
                )}
                aria-label={item.label}
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
      </nav>
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={PROFILE_NAV_ITEM.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent",
                pathname === PROFILE_NAV_ITEM.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground",
                isCollapsed ? "justify-center" : "",
              )}
              aria-label={PROFILE_NAV_ITEM.label}
            >
              <PROFILE_NAV_ITEM.icon className="h-5 w-5" />
              {!isCollapsed && PROFILE_NAV_ITEM.label}
            </Link>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">
              {PROFILE_NAV_ITEM.label}
            </TooltipContent>
          )}
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent mt-2",
                isCollapsed ? "justify-center" : "",
              )}
              onClick={() => void handleSignOut()} // Re-added void for no-misused-promises
              disabled={isSigningOut}
              aria-label={SIGN_OUT_LABEL}
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed &&
                (isSigningOut ? SIGNING_OUT_LABEL : SIGN_OUT_LABEL)}
            </Button>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">{SIGN_OUT_LABEL}</TooltipContent>
          )}
        </Tooltip>
      </div>
    </aside>
  );
}
