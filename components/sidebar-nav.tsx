import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants"; // Removed PROFILE_NAV_ITEM

interface SidebarNavProps {
  isCollapsed: boolean;
}

export function SidebarNav({ isCollapsed }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-1 px-3 py-2">
      {NAV_ITEMS.map((item) => (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-1 text-sidebar-foreground transition-all hover:bg-sidebar-accent",
                pathname.startsWith(item.href)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground",
                isCollapsed ? "justify-center" : "",
              )
            }
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
  );
}
