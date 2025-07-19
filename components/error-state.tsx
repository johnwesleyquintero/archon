"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AlertTriangle } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface ErrorStateProps {
  icon?: LucideIcon
  title: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  icon: Icon = AlertTriangle, // Default to AlertTriangle icon
  title,
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <Icon className="mb-4 h-12 w-12 text-red-500 dark:text-red-400" />
      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          className="bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Retry
        </Button>
      )}
    </div>
  )
}
