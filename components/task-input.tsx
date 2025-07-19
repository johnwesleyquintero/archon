// This file was previously abbreviated. Here is its full content.
"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Loader2 } from "lucide-react"

interface TaskInputProps {
  onAddTask: (title: string) => void
  disabled?: boolean
}

export function TaskInput({ onAddTask, disabled = false }: TaskInputProps) {
  const [taskTitle, setTaskTitle] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedTitle = taskTitle.trim()
    if (!trimmedTitle) return

    setIsAdding(true)
    try {
      await onAddTask(trimmedTitle)
      setTaskTitle("") // Clear input only on success
    } catch (error) {
      console.error("Error adding task:", error)
      // Error state will be handled by useTasks hook and displayed by TaskList
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="Add a new task..."
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
        className="flex-1"
        disabled={disabled || isAdding}
        aria-label="New task title"
      />
      <Button type="submit" disabled={disabled || isAdding}>
        {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        <span className="sr-only">Add Task</span>
      </Button>
    </form>
  )
}
