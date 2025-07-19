"use client"

import type React from "react"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
}

export function Modal({ isOpen, onClose, title, children, footer, size = "md", className }: ModalProps) {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <Card
        className={cn(
          "relative w-full shadow-2xl border-0 bg-white animate-in fade-in-0 zoom-in-95 duration-200",
          sizeClasses[size],
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle id="modal-title" className="text-lg font-semibold text-slate-900">
            {title}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        {/* Content */}
        <CardContent className="pb-6">{children}</CardContent>

        {/* Footer */}
        {footer && <CardFooter className="pt-0">{footer}</CardFooter>}
      </Card>
    </div>
  )
}
