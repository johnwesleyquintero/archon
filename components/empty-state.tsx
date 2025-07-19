"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

interface EmptyStateProps {
  message: string
  description?: string
  buttonText?: string
  onButtonClick?: () => void
  buttonDisabled?: boolean
}

export function EmptyState({ message, description, buttonText, onButtonClick, buttonDisabled }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400">
      <PlusCircle className="h-12 w-12 mb-4" />
      <h3 className="text-lg font-semibold mb-2">{message}</h3>
      {description && <p className="text-sm mb-4">{description}</p>}
      {buttonText && onButtonClick && (
        <Button
          onClick={onButtonClick}
          disabled={buttonDisabled}
          className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {buttonText}
        </Button>
      )}
    </div>
  )
}
