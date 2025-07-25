"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, EyeOff, Settings, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardWidgetProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  onRefresh?: () => void
  onToggleVisibility?: () => void
  onSettings?: () => void
  isVisible?: boolean
}

export function DashboardWidget({
  title,
  description,
  children,
  className,
  onRefresh,
  onToggleVisibility,
  onSettings,
  isVisible = true,
}: DashboardWidgetProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onRefresh && (
              <DropdownMenuItem onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
                Refresh
              </DropdownMenuItem>
            )}
            {onSettings && (
              <DropdownMenuItem onClick={onSettings}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            )}
            {(onRefresh || onSettings) && onToggleVisibility && <DropdownMenuSeparator />}
            {onToggleVisibility && (
              <DropdownMenuItem onClick={onToggleVisibility}>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Widget
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-1 pt-0">{children}</CardContent>
    </Card>
  )
}
