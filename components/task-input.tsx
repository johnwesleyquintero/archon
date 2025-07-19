"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

interface TaskInputProps {
  onAddTask: (title: string) => void
  disabled?: boolean
}

export function TaskInput({ onAddTask, disabled = false }: TaskInputProps) {
  const [newTask, setNewTask] = useState("")

  const handleAddTask = () => {
    if (newTask.trim()) {
      onAddTask(newTask.trim())
      setNewTask("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask()
    }
  }

  return (
    <div className="flex gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
      <Input
        placeholder="Add a new task..."
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        onKeyPress={handleKeyPress}
        className="flex-1 text-sm focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:ring-slate-600"
        disabled={disabled}
        aria-label="New task title"
      />
      <Button
        onClick={handleAddTask}
        size="sm"
        className="h-9 w-9 p-0 bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
        disabled={!newTask.trim() || disabled}
        aria-label="Add task"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
