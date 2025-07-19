"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskFilterBar } from "./task-filter-bar"
import { TaskInput } from "./task-input"
import { TaskList } from "./task-list"
import { useTasks } from "@/hooks/use-tasks"
import type { TaskFilterType, TaskSortType } from "@/lib/supabase/types"

/**
 * TodoList – the “Command Center” that wires the task engine (`useTasks`)
 * to the presentation layer (filter bar, list, and input).
 */
export function TodoList() {
  /* ------------------------------------------------------------------ */
  /*  Consume the dynamic, server-powered tasks hook                     */
  /* ------------------------------------------------------------------ */
  const { tasks, isLoading, error, filter, sort, setFilter, setSort, addTask, toggleTask, deleteTask, refetchTasks } =
    useTasks({})

  /* ------------------------------------------------------------------ */
  /*  Handler passed to EmptyState CTA inside <TaskList>                 */
  /* ------------------------------------------------------------------ */
  const handleEmptyStateAddTask = () => {
    // You could focus the TaskInput via ref; for now we just log.
    console.info("EmptyState ➜ Add New Task clicked")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Today's Tasks</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ----------------------------- Filter / Sort ----------------------------- */}
        <TaskFilterBar
          currentFilter={filter as TaskFilterType}
          currentSort={sort as TaskSortType}
          onFilterChange={setFilter}
          onSortChange={setSort}
          disabled={isLoading}
        />

        {/* ----------------------------- Task List ----------------------------- */}
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          error={error}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onRetry={refetchTasks}
          onAddTaskClick={handleEmptyStateAddTask}
        />

        {/* ----------------------------- Add Task Input ----------------------------- */}
        <TaskInput onAddTask={addTask} disabled={isLoading} />

        {/* ----------------------------- Summary ----------------------------- */}
        {!isLoading && !error && tasks.length > 0 && (
          <div className="pt-2 text-center text-xs text-muted-foreground">
            {tasks.filter((t) => t.completed).length} of {tasks.length} tasks completed
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* -----------------------------------------------------------------------------
 * Provide both named and default exports so importing is flexible.
 * --------------------------------------------------------------------------- */
export default TodoList
