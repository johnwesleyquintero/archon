import { AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NAV_ITEMS } from "@/lib/constants"; // Removed PROFILE_NAV_ITEM
import { cn } from "@/lib/utils";

import { SubNav } from "./sub-nav";

interface SidebarNavProps {
  isCollapsed: boolean;
}

export function SidebarNav({ isCollapsed }: SidebarNavProps) {
  const pathname = usePathname();
  const [openSubNav, setOpenSubNav] = useState<string | null>(null);

  const handleToggleSubNav = (label: string) => {
    setOpenSubNav(openSubNav === label ? null : label);
  };

  return (
    <nav className="grid items-start gap-1 px-3 py-2">
      {NAV_ITEMS.map((item) => (
        <div key={item.label}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-1 text-sidebar-foreground transition-all hover:bg-sidebar-accent",
                  pathname.startsWith(item.href) && !item.sub
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground",
                  isCollapsed ? "justify-center" : "",
                )}
              >
                <Link
                  href={item.href}
                  className="flex flex-1 items-center gap-3"
                  aria-label={item.label}
                  aria-current={
                    pathname.startsWith(item.href) && !item.sub
                      ? "page"
                      : undefined
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && item.label}
                </Link>
                {item.sub && !isCollapsed && (
                  <button
                    onClick={() => handleToggleSubNav(item.label)}
                    className="p-1"
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        openSubNav === item.label ? "rotate-180" : "",
                      )}
                    />
                  </button>
                )}
              </div>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">{item.label}</TooltipContent>
            )}
          </Tooltip>
          <AnimatePresence>
            {item.sub && openSubNav === item.label && (
              <SubNav items={item.sub} isCollapsed={isCollapsed} />
            )}
          </AnimatePresence>
        </div>
      ))}
    </nav>
  );
}
