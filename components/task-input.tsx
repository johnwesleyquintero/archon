"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

interface TaskInputProps {
  onAddTask: (title: string) => void
  placeholder?: string
  disabled?: boolean
}

export function TaskInput({ onAddTask, placeholder = "Add a new task...", disabled = false }: TaskInputProps) {
  const [inputValue, setInputValue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !disabled) {
      onAddTask(inputValue.trim())
      setInputValue("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-slate-100">
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        className="flex-1 h-9 text-sm border-slate-200 focus:border-slate-400 focus:ring-slate-400"
        aria-label="New task title"
      />
      <Button
        type="submit"
        size="sm"
        disabled={!inputValue.trim() || disabled}
        className="h-9 w-9 p-0 bg-slate-900 hover:bg-slate-800 disabled:opacity-50"
        aria-label="Add task"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  )
}
