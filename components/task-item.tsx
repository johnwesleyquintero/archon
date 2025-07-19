"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskItemProps {
  id: string
  title: string
  completed: boolean
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskItem({ id, title, completed, onToggle, onDelete }: TaskItemProps) {
  return (
    <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
      <Checkbox
        checked={completed}
        onCheckedChange={() => onToggle(id)}
        className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
        aria-label={`Mark "${title}" as ${completed ? "incomplete" : "complete"}`}
      />
      <span
        className={cn(
          "flex-1 text-sm transition-all",
          completed ? "line-through text-slate-500 opacity-75" : "text-slate-900",
        )}
      >
        {title}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
        aria-label={`Delete "${title}"`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
