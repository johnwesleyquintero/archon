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
function TodoList() {
  /* ------------------------------------------------------------------ */
  /*  Consume the dynamic, server-powered tasks hook                     */
  /* ------------------------------------------------------------------ */
  const { tasks, isLoading, error, filter, sort, setFilter, setSort, addTask, toggleTask, deleteTask, refetchTasks } =
    useTasks({})

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">Today's Tasks</CardTitle>
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
          onAddTaskClick={() => {
            /* Logic to open add task modal or focus input */
          }}
        />

        {/* ----------------------------- Add Task Input ----------------------------- */}
        <TaskInput onAddTask={addTask} disabled={isLoading} />

        {/* ----------------------------- Summary ----------------------------- */}
        {!isLoading && !error && tasks.length > 0 && (
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2">
            {tasks.filter((task) => task.completed).length} of {tasks.length} tasks completed
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { TodoList }
export default TodoList
