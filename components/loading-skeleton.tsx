"use client"

import { Skeleton } from "@/components/ui/skeleton"

interface LoadingSkeletonProps {
  rows?: number
  showCircle?: boolean
  className?: string
}

export function LoadingSkeleton({ rows = 4, showCircle = false, className = "" }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3">
          {showCircle && <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full max-w-[300px]" />
            {index % 2 === 0 && <Skeleton className="h-3 w-3/4 max-w-[200px]" />}
          </div>
        </div>
      ))}
    </div>
  )
}
