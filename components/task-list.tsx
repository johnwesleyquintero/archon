import { TaskItem } from "./task-item";
import { TaskFilterBar } from "./task-filter-bar";
import { TaskSort } from "./task-sort";
import { EmptyState } from "./empty-state";
import { useTasks } from "@/hooks/use-tasks";
import { useTaskFiltersAndSort } from "@/hooks/use-task-filters-and-sort";
import { Skeleton } from "@/components/ui/skeleton";
import { ListTodo, Filter } from "lucide-react";
import { Database } from "@/lib/supabase/types";
import { useState } from "react";
import { TaskDetailsModal } from "./task-details-modal";
import { Task } from "@/lib/types/task";
import { Button } from "@/components/ui/button";
import { deleteMultipleTasks } from "@/app/tasks/actions";
import { toast } from "sonner";

import type { TaskFormValues } from "@/lib/validators"; // Import TaskFormValues

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onAddTaskClick: () => void;
  onAddTask: (
    taskData: TaskFormValues & { parent_id?: string },
  ) => Promise<void>; // Added onAddTask prop
}

export function TaskList({
  tasks,
  loading,
  onAddTaskClick,
  onAddTask,
}: TaskListProps) {
  const { toggleTask, deleteTask, updateTask, isMutating } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const { filteredAndSortedTasks, sort, setSort, filters, setFilters } =
    useTaskFiltersAndSort(tasks);

  const handleOpenModal = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  const handleSelectTask = (id: string) => {
    setSelectedTasks((prev) =>
      prev.includes(id)
        ? prev.filter((taskId) => taskId !== id)
        : [...prev, id],
    );
  };

  const handleDeleteSelected = () => {
    void deleteMultipleTasks(selectedTasks);
    toast.success(`${selectedTasks.length} tasks deleted.`);
    setSelectedTasks([]);
  };

  const handleToggle = async (id: string, is_completed: boolean) => {
    await toggleTask(id, is_completed);
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
  };

  const handleUpdate = async (
    id: string,
    updatedTask: Partial<Database["public"]["Tables"]["tasks"]["Update"]>,
  ) => {
    await updateTask(id, updatedTask);
  };

  // The loading state is managed by the parent component (TodoList)
  // TODO: Investigate why @typescript-eslint/await-thenable is triggered here.
  // This appears to be a false positive as 'loading' is a boolean and not awaited.
  if (loading) {
    return (
      <div className="flex flex-col h-full py-2 space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center space-x-2"
            data-testid="task-skeleton"
          >
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <TaskDetailsModal
        isOpen={!!selectedTask}
        onClose={handleCloseModal}
        task={selectedTask}
        onUpdate={async (id, updatedTask) => {
          await handleUpdate(id, updatedTask);
        }}
      />
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
          {selectedTasks.length > 0 && (
            <div className="p-2 border-b flex items-center justify-between bg-slate-50 dark:bg-slate-800">
              <span className="text-sm font-medium">
                {selectedTasks.length} selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => void handleDeleteSelected()}
              >
                Delete Selected
              </Button>
            </div>
          )}
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
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                    onAddTask={onAddTask}
                    onOpenModal={handleOpenModal}
                    disabled={isMutating}
                    isSelected={selectedTasks.includes(task.id)}
                    onSelect={handleSelectTask}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
