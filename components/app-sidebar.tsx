"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Removed usePathname

import { LogOut } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { SIGN_OUT_LABEL, SIGNING_OUT_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";

import Logo from "./logo.js";
import { Button } from "./ui/button.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip.js";
import { SidebarNav } from "./sidebar-nav.js"; // Import the new component

interface AppSidebarProps {
  isCollapsed?: boolean;
}

export function AppSidebar({ isCollapsed = false }: AppSidebarProps) {
  // const pathname = usePathname(); // Removed unused pathname
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
      <SidebarNav isCollapsed={isCollapsed} />
      <div className="mt-auto flex flex-col items-center gap-4 p-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-full"
              onClick={() => {
                void handleSignOut();
              }}
              disabled={isSigningOut}
              aria-label={isSigningOut ? SIGNING_OUT_LABEL : SIGN_OUT_LABEL}
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && (
                <span className="ml-2">
                  {isSigningOut ? SIGNING_OUT_LABEL : SIGN_OUT_LABEL}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">
              {isSigningOut ? SIGNING_OUT_LABEL : SIGN_OUT_LABEL}
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </aside>
  );
}
