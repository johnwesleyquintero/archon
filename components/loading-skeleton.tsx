// This file was previously abbreviated. Here is its full content.
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
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          {showCircle && <Skeleton className="h-8 w-8 rounded-full" />}
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>
      ))}
    </div>
  )
}
