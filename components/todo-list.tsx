"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  completed: boolean
}

export function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Review quarterly reports", completed: false },
    { id: "2", title: "Schedule team meeting", completed: true },
    { id: "3", title: "Update project documentation", completed: false },
    { id: "4", title: "Prepare presentation slides", completed: false },
    { id: "5", title: "Send follow-up emails", completed: true },
  ])

  const [newTask, setNewTask] = useState("")

  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.trim(),
        completed: false,
      }
      setTasks([...tasks, task])
      setNewTask("")
    }
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTask()
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900">Today's Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Task List */}
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="group flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
              />
              <span
                className={cn(
                  "flex-1 text-sm transition-all",
                  task.completed ? "line-through text-slate-500" : "text-slate-900",
                )}
              >
                {task.title}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">No tasks for today</p>
              <p className="text-xs mt-1">Add a task to get started</p>
            </div>
          )}
        </div>

        {/* Add New Task */}
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <Input
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 h-9 text-sm border-slate-200 focus:border-slate-400 focus:ring-slate-400"
          />
          <Button
            onClick={addTask}
            size="sm"
            className="h-9 w-9 p-0 bg-slate-900 hover:bg-slate-800"
            disabled={!newTask.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Task Summary */}
        {tasks.length > 0 && (
          <div className="text-xs text-slate-500 text-center pt-2">
            {tasks.filter((task) => task.completed).length} of {tasks.length} tasks completed
          </div>
        )}
      </CardContent>
    </Card>
  )
}
