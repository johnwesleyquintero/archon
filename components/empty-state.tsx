"use client"

// This file was previously abbreviated. Here is its full content.
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { type LucideIcon, CheckSquare } from "lucide-react" // Default icon

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon = CheckSquare, // Default to CheckSquare
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12 px-4", className)}>
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  )
}
