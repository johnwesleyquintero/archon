"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface SettingsNavProps {
  items: {
    href: string
    label: string
  }[]
}

export function SettingsNav({ items }: SettingsNavProps) {
  const pathname = usePathname()

  return (
    <nav className="grid gap-2 text-sm text-slate-600">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center rounded-md px-3 py-2 transition-colors hover:bg-slate-100",
            pathname === item.href ? "bg-slate-100 text-slate-900 font-medium" : "",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
