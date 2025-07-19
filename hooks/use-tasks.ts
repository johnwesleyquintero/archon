"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getTasks,
  addTask as dbAddTask,
  toggleTask as dbToggleTask,
  deleteTask as dbDeleteTask,
} from "@/lib/database/tasks"
import type { Task, TaskFilterType, TaskSortType } from "@/lib/supabase/types"
import { useAuth } from "@/contexts/auth-context" // Import useAuth to get user ID

interface UseTasksProps {
  initialFilter?: TaskFilterType
  initialSort?: TaskSortType
}

interface UseTasksResult {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  filter: TaskFilterType
  sort: TaskSortType
  setFilter: (filter: TaskFilterType) => void
  setSort: (sort: TaskSortType) => void
  addTask: (title: string) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  refetchTasks: () => Promise<void>
}

export function useTasks({ initialFilter = "all", initialSort = "newest" }: UseTasksProps = {}): UseTasksResult {
  const { user, isLoading: isAuthLoading } = useAuth() // Get user from auth context
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<TaskFilterType>(initialFilter)
  const [sort, setSort] = useState<TaskSortType>(initialSort)

  const fetchTasks = useCallback(async () => {
    if (!user?.id) {
      // If user is not logged in or still loading auth, don't fetch tasks
      setTasks([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await getTasks(user.id, filter, sort)
      if (dbError) {
        throw new Error(dbError.message)
      }
      setTasks(data || [])
    } catch (err: any) {
      console.error("Failed to fetch tasks:", err)
      setError(err.message || "Failed to load tasks. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, filter, sort])

  useEffect(() => {
    if (!isAuthLoading) {
      // Only fetch tasks once auth state is known
      fetchTasks()
    }
  }, [fetchTasks, isAuthLoading])

  const addTask = useCallback(
    async (title: string) => {
      const tempId = `temp-${Date.now()}` // Declare tempId variable
      if (!user?.id) {
        setError("User not authenticated. Cannot add task.")
        return
      }
      try {
        // Optimistic update
        const newTask: Task = {
          id: tempId,
          title,
          completed: false,
          user_id: user.id,
          created_at: new Date().toISOString(),
          due_date: null,
        }
        setTasks((prevTasks) => [...prevTasks, newTask])

        const { data, error: dbError } = await dbAddTask(user.id, title)
        if (dbError) {
          throw new Error(dbError.message)
        }
        // Replace temporary task with actual task from DB
        setTasks((prevTasks) => prevTasks.map((task) => (task.id === tempId ? data[0] : task)))
      } catch (err: any) {
        console.error("Failed to add task:", err)
        setError(err.message || "Failed to add task.")
        // Revert optimistic update
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== tempId))
      }
    },
    [user?.id],
  )

  const toggleTask = useCallback(
    async (id: string) => {
      if (!user?.id) {
        setError("User not authenticated. Cannot toggle task.")
        return
      }
      try {
        // Optimistic update
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
        )

        const taskToUpdate = tasks.find((task) => task.id === id)
        if (!taskToUpdate) return

        const { error: dbError } = await dbToggleTask(user.id, id, !taskToUpdate.completed)
        if (dbError) {
          throw new Error(dbError.message)
        }
      } catch (err: any) {
        console.error("Failed to toggle task:", err)
        setError(err.message || "Failed to update task status.")
        // Revert optimistic update
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
        )
      }
    },
    [tasks, user?.id],
  ) // Dependency on tasks for finding taskToUpdate

  const deleteTask = useCallback(
    async (id: string) => {
      if (!user?.id) {
        setError("User not authenticated. Cannot delete task.")
        return
      }
      try {
        // Optimistic update
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id))

        const { error: dbError } = await dbDeleteTask(user.id, id)
        if (dbError) {
          throw new Error(dbError.message)
        }
      } catch (err: any) {
        console.error("Failed to delete task:", err)
        setError(err.message || "Failed to delete task.")
        // Revert optimistic update (re-add the task if deletion failed)
        const originalTask = tasks.find((task) => task.id === id)
        if (originalTask) {
          setTasks((prevTasks) => [...prevTasks, originalTask])
        }
      }
    },
    [tasks, user?.id],
  ) // Dependency on tasks for finding originalTask

  return {
    tasks,
    isLoading: isLoading || isAuthLoading,
    error,
    filter,
    sort,
    setFilter,
    setSort,
    addTask,
    toggleTask,
    deleteTask,
    refetchTasks: fetchTasks,
  }
}
