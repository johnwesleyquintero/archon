"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  rows?: number
  showCircle?: boolean
  className?: string
}

export function LoadingSkeleton({ rows = 4, showCircle = true, className }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          {showCircle && <Skeleton className="h-8 w-8 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            {i % 2 === 0 && <Skeleton className="h-4 w-3/4" />} {/* Vary length for visual interest */}
          </div>
        </div>
      ))}
    </div>
  )
}
