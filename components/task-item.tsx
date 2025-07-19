"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Trash2 } from "lucide-react"

interface TaskItemProps {
  id: string
  title: string
  completed: boolean
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskItem({ id, title, completed, onToggle, onDelete }: TaskItemProps) {
  return (
    <div
      className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
      data-task-id={id}
    >
      <Checkbox
        checked={completed}
        onCheckedChange={() => onToggle(id)}
        className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 dark:data-[state=checked]:bg-slate-50 dark:data-[state=checked]:border-slate-50"
        aria-label={`Mark task "${title}" as ${completed ? "incomplete" : "complete"}`}
      />
      <span
        className={cn(
          "flex-1 text-sm transition-all",
          completed ? "line-through text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-slate-50",
        )}
      >
        {title}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(id)}
        className="h-8 w-8 p-0 text-slate-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:text-slate-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
        aria-label={`Delete task "${title}"`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
