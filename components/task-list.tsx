// This file was previously abbreviated. Here is its full content.
"use client"

import { TaskItem } from "./task-item"
import { LoadingSkeleton } from "./loading-skeleton"
import { EmptyState } from "./empty-state"
import { ErrorState } from "./error-state"
import { CheckSquare, AlertTriangle } from "lucide-react"
import type { Task } from "@/lib/supabase/types"

interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onRetry: () => void // For retrying data fetch
  onAddTaskClick: () => void // For EmptyState action
}

export function TaskList({ tasks, isLoading, error, onToggle, onDelete, onRetry, onAddTaskClick }: TaskListProps) {
  if (isLoading) {
    return <LoadingSkeleton rows={5} showCircle={true} className="p-4" />
  }

  if (error) {
    return (
      <ErrorState
        icon={AlertTriangle}
        title="Failed to Load Tasks"
        message={error}
        onRetry={onRetry}
        className="py-8"
      />
    )
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="No Tasks for Today"
        description="Add a task to get started and stay organized."
        actionLabel="Add New Task"
        onAction={onAddTaskClick}
        className="py-8"
      />
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          id={task.id}
          title={task.title}
          completed={task.completed}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
