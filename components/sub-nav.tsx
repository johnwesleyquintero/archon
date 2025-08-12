import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/constants";

interface SubNavProps {
  items: NavItem[];
  isCollapsed: boolean;
}

export function SubNav({ items, isCollapsed }: SubNavProps) {
  const pathname = usePathname();

  if (isCollapsed) {
    return null;
  }

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden pl-8"
    >
      <div className="grid items-start gap-1 py-1">
        {items.map((item: NavItem) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-1 text-sidebar-foreground transition-all hover:bg-sidebar-accent",
              pathname.startsWith(item.href)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground",
            )}
            aria-label={item.label}
            aria-current={pathname.startsWith(item.href) ? "page" : undefined}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
