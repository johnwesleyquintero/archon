import { TaskItem } from "./task-item";
import { TaskFilterBar } from "./task-filter-bar";
import { TaskSort } from "./task-sort";
import { EmptyState } from "./empty-state";
import { useTasks } from "@/hooks/use-tasks";
import { useTaskFiltersAndSort } from "@/hooks/use-task-filters-and-sort";
import { Skeleton } from "@/components/ui/skeleton";
import { ListTodo, Filter } from "lucide-react";
import { Database } from "@/lib/supabase/types";
import { useState, useMemo, useCallback } from "react";
import { TaskDetailsModal } from "./task-details-modal";
import { Task } from "@/lib/types/task";
import { Goal } from "@/lib/types/goal"; // Import Goal type
import { Button } from "@/components/ui/button";
import { deleteMultipleTasks, updateTaskSortOrder } from "@/app/tasks/actions"; // Import updateTaskSortOrder
import { toast } from "sonner";

import type { TaskFormValues } from "@/lib/validators"; // Import TaskFormValues

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onAddTaskClick: () => void;
  onAddTask: (
    taskData: TaskFormValues & { parent_id?: string },
  ) => Promise<void>;
  allTasks?: Task[]; // New prop for all tasks to select parent
  goals?: Goal[] | null; // New prop for goals, using the Goal type
}

export function TaskList({
  tasks,
  loading,
  onAddTaskClick,
  onAddTask,
  allTasks = [], // Default to empty array
  goals = [], // Default to empty array
}: TaskListProps) {
  const { toggleTask, deleteTask, updateTask, isMutating, setTasks } =
    useTasks(tasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const { filteredAndSortedTasks, sort, setSort, filters, setFilters } =
    useTaskFiltersAndSort(tasks);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const allAvailableTags = useMemo(() => {
    const tags = new Set<string>();
    tasks.forEach((task) => {
      task.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [tasks]);

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

  const handleClearFilters = () => {
    setFilters({
      status: "all",
      priority: "all",
      dueDate: "all",
      category: null,
      tags: [],
    });
  };

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        const oldIndex = filteredAndSortedTasks.findIndex(
          (task) => task.id === active.id,
        );
        const newIndex = filteredAndSortedTasks.findIndex(
          (task) => task.id === over?.id,
        );

        if (oldIndex === -1 || newIndex === -1) return;

        const newOrder = arrayMove(filteredAndSortedTasks, oldIndex, newIndex);

        setTasks(newOrder);

        const updatesToSend = newOrder.map((task, index) => ({
          id: task.id,
          sort_order: index,
        }));

        try {
          await updateTaskSortOrder(updatesToSend);
          toast.success("Task order updated.");
        } catch (error) {
          console.error("Failed to update task order:", error);
          toast.error("Failed to update task order.");
          setTasks(tasks);
        }
      }
    },
    [filteredAndSortedTasks, tasks, setTasks],
  );

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
        goals={goals?.map((goal) => ({ id: goal.id, title: goal.title }))}
        allTasks={allTasks} // Pass all tasks to the modal
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
              onAction={handleClearFilters}
              icon={Filter}
            />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredAndSortedTasks.map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-1">
                  {filteredAndSortedTasks.map((task) => (
                    <li key={task.id}>
                      <TaskItem
                        {...task}
                        goal={goals?.find((g) => g.id === task.goal_id)}
                        onToggle={(id, is_completed) => {
                          void handleToggle(id, is_completed);
                        }}
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
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </>
  );
}
