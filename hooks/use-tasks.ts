"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getTasks,
  createTask as dbCreateTask,
  updateTask as dbUpdateTask,
  deleteTask as dbDeleteTask,
} from "@/lib/database/tasks"
import type { Task, TaskFilterType, TaskSortType } from "@/lib/supabase/types"
import { useAuth } from "@/contexts/auth-context" // Assuming useAuth provides current user ID

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
  const { user } = useAuth() // Get user from auth context
  const userId = user?.id // Assuming user object has an 'id' property

  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<TaskFilterType>(initialFilter)
  const [sort, setSort] = useState<TaskSortType>(initialSort)

  const fetchTasks = useCallback(async () => {
    if (!userId) {
      setTasks([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await getTasks(userId, filter, sort)
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
  }, [userId, filter, sort]) // Re-fetch when userId, filter, or sort changes

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const addTask = useCallback(
    async (title: string) => {
      if (!userId) {
        setError("User not authenticated. Cannot add task.")
        return
      }
      try {
        // Optimistic update
        const tempId = `temp-${Date.now()}`
        const newTask: Task = {
          id: tempId,
          title,
          completed: false,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          due_date: null, // Assuming due_date can be null
        }
        setTasks((prevTasks) => {
          const updatedTasks = [...prevTasks, newTask]
          // Re-sort the optimistic list to maintain order if 'newest' or 'oldest'
          if (sort === "newest") {
            return updatedTasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          } else if (sort === "oldest") {
            return updatedTasks.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          }
          // For 'dueDate' or 'all' filter, the new task might not appear immediately if it doesn't match the filter
          // or if due_date is not set. This is a known limitation of optimistic updates with complex filters.
          return updatedTasks
        })

        const { data, error: dbError } = await dbCreateTask({ title, user_id: userId, completed: false })
        if (dbError) {
          throw new Error(dbError.message)
        }
        // Replace temporary task with actual task from DB
        setTasks((prevTasks) => prevTasks.map((task) => (task.id === tempId ? data : task)))
      } catch (err: any) {
        console.error("Failed to add task:", err)
        setError(err.message || "Failed to add task.")
        // Revert optimistic update
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== `temp-${Date.now()}`))
      }
    },
    [userId, sort],
  ) // Dependency on sort for optimistic re-sorting

  const toggleTask = useCallback(
    async (id: string) => {
      if (!userId) {
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

        const { error: dbError } = await dbUpdateTask(id, { completed: !taskToUpdate.completed })
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
    [tasks, userId],
  ) // Dependency on tasks for finding taskToUpdate

  const deleteTask = useCallback(
    async (id: string) => {
      if (!userId) {
        setError("User not authenticated. Cannot delete task.")
        return
      }
      try {
        // Optimistic update
        const originalTask = tasks.find((task) => task.id === id) // Store for potential revert
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id))

        const { success, error: dbError } = await dbDeleteTask(id)
        if (dbError || !success) {
          throw new Error(dbError?.message || "Deletion failed.")
        }
      } catch (err: any) {
        console.error("Failed to delete task:", err)
        setError(err.message || "Failed to delete task.")
        // Revert optimistic update (re-add the task if deletion failed)
        const originalTask = tasks.find((task) => task.id === id) // Re-find in case tasks array changed
        if (originalTask) {
          setTasks((prevTasks) => [...prevTasks, originalTask])
        }
      }
    },
    [tasks, userId],
  ) // Dependency on tasks for finding originalTask

  return {
    tasks,
    isLoading,
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
