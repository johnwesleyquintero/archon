"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, EyeOff, Settings, Trash2, RefreshCw, Maximize2, Minimize2 } from "lucide-react"

interface DashboardWidgetProps {
  title: string
  children: React.ReactNode
  isCustomizing?: boolean
  onRemove?: () => void
  onRefresh?: () => void
  onToggleVisibility?: () => void
  isVisible?: boolean
  className?: string
}

export function DashboardWidget({
  title,
  children,
  isCustomizing = false,
  onRemove,
  onRefresh,
  onToggleVisibility,
  isVisible = true,
  className = "",
}: DashboardWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false)
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

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  if (!isVisible && !isCustomizing) {
    return null
  }

  return (
    <Card className={`h-full flex flex-col ${!isVisible ? "opacity-50" : ""} ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
        <CardTitle className="text-sm font-medium flex items-center space-x-2">
          <span>{title}</span>
          {!isVisible && (
            <Badge variant="secondary" className="text-xs">
              Hidden
            </Badge>
          )}
          {isCustomizing && (
            <Badge variant="outline" className="text-xs">
              Customizing
            </Badge>
          )}
        </CardTitle>

        <div className="flex items-center space-x-1">
          {isRefreshing && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRefresh && (
                <DropdownMenuItem onClick={handleRefresh} disabled={isRefreshing}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={handleToggleExpand}>
                {isExpanded ? (
                  <>
                    <Minimize2 className="mr-2 h-4 w-4" />
                    Minimize
                  </>
                ) : (
                  <>
                    <Maximize2 className="mr-2 h-4 w-4" />
                    Expand
                  </>
                )}
              </DropdownMenuItem>

              {onToggleVisibility && (
                <DropdownMenuItem onClick={onToggleVisibility}>
                  {isVisible ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Show
                    </>
                  )}
                </DropdownMenuItem>
              )}

              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </DropdownMenuItem>

              {isCustomizing && onRemove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onRemove} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className={`flex-1 overflow-auto ${isExpanded ? "p-6" : "p-4"}`}>
        {isVisible ? (
          children
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <EyeOff className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Widget is hidden</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
