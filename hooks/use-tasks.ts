"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { getTasks, addTask, toggleTask, deleteTask } from "@/lib/database/tasks"
import type { Database } from "@/lib/supabase/types"
import { useAuth } from "@/contexts/auth-context"

type Task = Database["public"]["Tables"]["tasks"]["Row"]

export function useTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const fetchedTasks = await getTasks()
      setTasks(fetchedTasks)
    } catch (err) {
      console.error("Failed to fetch tasks:", err)
      setError("Failed to load tasks. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleAddTask = useCallback(
    async (title: string) => {
      if (!user) {
        setError("You must be logged in to add tasks.")
        return
      }
      setError(null)
      startTransition(async () => {
        try {
          // Optimistic update
          const tempId = `temp-${Date.now()}`
          const newTask: Task = {
            id: tempId,
            title,
            completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: user.id, // Use actual user ID for optimistic update
          }
          setTasks((prev) => [newTask, ...prev])

          const addedTask = await addTask(title)
          if (addedTask) {
            setTasks((prev) => prev.map((task) => (task.id === tempId ? addedTask : task)))
          } else {
            // Revert optimistic update if actual add failed
            setTasks((prev) => prev.filter((task) => task.id !== tempId))
            setError("Failed to add task.")
          }
        } catch (err: any) {
          console.error("Error adding task:", err)
          setError(err.message || "Failed to add task.")
          // Revert optimistic update on error
          setTasks((prev) => prev.filter((task) => task.id !== `temp-${Date.now()}`))
        }
      })
    },
    [user],
  )

  const handleToggleTask = useCallback(
    async (id: string, completed: boolean) => {
      if (!user) {
        setError("You must be logged in to update tasks.")
        return
      }
      setError(null)
      startTransition(async () => {
        try {
          // Optimistic update
          setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: completed } : task)))
          const updatedTask = await toggleTask(id, completed)
          if (!updatedTask) {
            // Revert optimistic update if actual update failed
            setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !completed } : task)))
            setError("Failed to update task status.")
          }
        } catch (err: any) {
          console.error("Error toggling task:", err)
          setError(err.message || "Failed to update task status.")
          // Revert optimistic update on error
          setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !completed } : task)))
        }
      })
    },
    [user],
  )

  const handleDeleteTask = useCallback(
    async (id: string) => {
      if (!user) {
        setError("You must be logged in to delete tasks.")
        return
      }
      setError(null)
      startTransition(async () => {
        try {
          // Optimistic update
          const originalTasks = tasks
          setTasks((prev) => prev.filter((task) => task.id !== id))

          await deleteTask(id)
        } catch (err: any) {
          console.error("Error deleting task:", err)
          setError(err.message || "Failed to delete task.")
          // Revert optimistic update on error
          setTasks(tasks) // Restore original tasks
        }
      })
    },
    [user, tasks],
  )

  return {
    tasks,
    loading,
    error,
    isMutating: isPending, // Use isPending from useTransition for mutation state
    addTask: handleAddTask,
    toggleTask: handleToggleTask,
    deleteTask: handleDeleteTask,
    refetchTasks: fetchTasks,
  }
}
