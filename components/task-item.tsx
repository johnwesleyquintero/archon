"use client"

// This file was previously abbreviated. Here is its full content.
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface TaskItemProps {
  id: string
  title: string
  completed: boolean
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskItem({ id, title, completed, onToggle, onDelete }: TaskItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="flex items-center justify-between p-3 rounded-md bg-card text-card-foreground shadow-sm transition-all duration-200 ease-in-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3 flex-1">
        <Checkbox
          id={`task-${id}`}
          checked={completed}
          onCheckedChange={() => onToggle(id)}
          aria-label={`Mark task "${title}" as ${completed ? "incomplete" : "complete"}`}
        />
        <label
          htmlFor={`task-${id}`}
          className={cn(
            "text-base font-medium cursor-pointer flex-1",
            completed && "line-through text-muted-foreground opacity-70",
          )}
        >
          {title}
        </label>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(id)}
        className={cn("ml-2 h-8 w-8 transition-opacity duration-200", isHovered ? "opacity-100" : "opacity-0")}
        aria-label={`Delete task "${title}"`}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  )
}
