"use client"

// This file was previously abbreviated. Here is its full content.
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { type LucideIcon, AlertTriangle } from "lucide-react" // Default icon

interface ErrorStateProps {
  icon?: LucideIcon
  title: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  icon: Icon = AlertTriangle, // Default to AlertTriangle
  title,
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12 px-4", className)}>
      <Icon className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">{message}</p>
      {onRetry && <Button onClick={onRetry}>Retry</Button>}
    </div>
  )
}
