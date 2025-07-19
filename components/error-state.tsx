"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, type LucideIcon } from "lucide-react"

interface ErrorStateProps {
  icon?: LucideIcon
  title: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ icon: Icon = AlertTriangle, title, message, onRetry, className = "" }: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <Icon className="h-8 w-8 text-destructive" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>

      <p className="text-sm text-muted-foreground mb-6 max-w-sm leading-relaxed">{message}</p>

      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="min-w-[120px] bg-transparent">
          Try Again
        </Button>
      )}
    </div>
  )
}
