"use client";

import { TaskItem } from "./task-item";
import { TaskFilterBar } from "./task-filter-bar";
import { TaskSort } from "./task-sort";
import { EmptyState } from "./empty-state";
import { useTasks } from "@/hooks/use-tasks";
import { useTaskFiltersAndSort } from "@/hooks/use-task-filters-and-sort";
import { Skeleton } from "@/components/ui/skeleton";
import { ListTodo, Filter } from "lucide-react";

interface TaskListProps {
  onAddTaskClick: () => void;
}

export function TaskList({ onAddTaskClick }: TaskListProps) {
  const { tasks, loading, toggleTask, deleteTask, isMutating } = useTasks();
  const { filteredAndSortedTasks, sort, setSort, filters, setFilters } =
    useTaskFiltersAndSort(tasks);

  if (loading) {
    return (
      <div className="flex flex-col h-full py-2 space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-2 p-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
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
          />
          <TaskSort sort={sort} onSortChange={setSort} />
        </div>
      </div>

      <div className="flex-1 overflow-auto py-2">
        {tasks.length === 0 ? (
          <EmptyState
            title="No tasks yet!"
            description="Looks like your to-do list is sparkling clean. Ready to add your first task and conquer the day?"
            actionLabel="Add New Task"
            onAction={onAddTaskClick}
            icon={ListTodo}
          />
        ) : filteredAndSortedTasks.length === 0 ? (
          <EmptyState
            title="No matching tasks found."
            description="It seems no tasks match your current filter criteria. Try adjusting your filters to see more tasks!"
            actionLabel="Clear Filters"
            onAction={() =>
              setFilters({
                status: "all",
                priority: "all",
                dueDate: "all",
                category: null,
                tags: [],
              })
            }
            icon={Filter}
          />
        ) : (
          <ul className="space-y-1">
            {filteredAndSortedTasks.map((task) => (
              <li key={task.id}>
                <TaskItem
                  {...task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  disabled={isMutating}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
