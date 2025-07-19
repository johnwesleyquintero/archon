"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { Package } from "lucide-react" // Default icon

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon = Package, // Default to Package icon
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <Icon className="mb-4 h-12 w-12 text-slate-400 dark:text-slate-600" />
      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
