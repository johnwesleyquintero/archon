"use client";

import { useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskInput } from "./task-input";
import { TaskList } from "./task-list";
import { useTasks } from "@/hooks/use-tasks";
import { useGoals } from "@/hooks/use-goals";
import { useAuth } from "@/contexts/auth-context";
import { Task as TaskType } from "@/lib/types/task";
import { TaskFormValues } from "@/lib/validators";
import {
  useTaskFiltersAndSort,
  TaskFilters,
} from "@/hooks/use-task-filters-and-sort";
import { TaskFilterBar } from "./task-filter-bar";
import { TaskSort } from "./task-sort";

interface TodoListProps {
  initialTasks?: TaskType[];
}

export function TodoList({ initialTasks }: TodoListProps) {
  const { tasks, loading, addTask, isMutating } = useTasks(initialTasks);
  const { goals } = useGoals();
  const { user } = useAuth();
  const taskInputRef = useRef<HTMLInputElement>(null);

  const {
    filteredAndSortedTasks,
    sort,
    setSort,
    filters,
    setFilters,
  } = useTaskFiltersAndSort(tasks);

  const allAvailableTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach((task) => {
      if (task.tags) {
        task.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  }, [tasks]);

  const handleAddTaskClick = () => {
    taskInputRef.current?.focus();
  };

  const handleAddTask = async (input: TaskFormValues) => {
    if (user) {
      await addTask({
        ...input,
        user_id: user.id,
        status: "todo",
      });
    }
  };

  const handleClearFilters = () => {
    setFilters({
      status: "all",
      priority: "all",
      dueDate: "all",
      category: null,
      tags: [],
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Todo List</CardTitle>
        <TaskSort sort={sort} onSortChange={setSort} />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4">
        <TaskFilterBar
          currentFilter={filters.status}
          onFilterChange={(status) => setFilters({ ...filters, status })}
          priorityFilter={filters.priority}
          onPriorityFilterChange={(priority) =>
            setFilters({ ...filters, priority })
          }
          dueDateFilter={filters.dueDate}
          onDueDateFilterChange={(dueDate) =>
            setFilters({ ...filters, dueDate })
          }
          categoryFilter={filters.category}
          onCategoryFilterChange={(category) =>
            setFilters({ ...filters, category })
          }
          tagFilter={filters.tags.length > 0 ? filters.tags[0] : null}
          onTagFilterChange={(tag) =>
            setFilters({ ...filters, tags: tag ? [tag] : [] })
          }
          allAvailableTags={allAvailableTags}
          onClearFilters={handleClearFilters}
        />
        <TaskList
          tasks={filteredAndSortedTasks}
          loading={loading}
          onAddTaskClick={handleAddTaskClick}
          onAddTask={handleAddTask}
          allTasks={tasks}
          goals={goals}
        />
        <TaskInput
          ref={taskInputRef}
          onAddTask={handleAddTask}
          disabled={isMutating || !user}
          goals={goals}
        />
      </CardContent>
    </Card>
  );
}
