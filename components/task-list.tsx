import { TaskDependency } from "@/lib/types/task-dependency"; // Import TaskDependency type
import { Button } from "@/components/ui/button";
import {
  deleteMultipleTasks,
  updateTaskOrder,
  archiveMultipleTasks,
  unarchiveMultipleTasks,
  archiveTask,
  deletePermanentlyTask,
} from "@/app/tasks/actions"; // Import new actions
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
  DragOverlay,
  DragStartEvent, // Import DragStartEvent
  UniqueIdentifier, // Import UniqueIdentifier
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { ListTodo } from "lucide-react";
import { useState, useCallback } from "react";
import { createPortal } from "react-dom"; // Import createPortal for DragOverlay

import { Skeleton } from "@/components/ui/skeleton";
import { useTasks } from "@/hooks/use-tasks";
import { Database } from "@/lib/supabase/types";
import { Goal } from "@/lib/types/goal"; // Import Goal type
import { Task } from "@/lib/types/task";

import { EmptyState } from "./empty-state";
import { TaskDetailsModal } from "./task-details-modal";
import { TaskItem } from "./task-item";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onAddTaskClick: () => void;
  onAddTask: (
    taskData: TaskFormValues & { parent_id?: string },
  ) => Promise<void>;
  allTasks?: Task[]; // New prop for all tasks to select parent
  goals?: Goal[] | null; // New prop for goals, using the Goal type
  onEditTask: (task: Task) => void; // New prop for editing tasks
  taskDependencies?: TaskDependency[]; // New prop for task dependencies
  onRefreshDependencies: () => void;
}

export function TaskList({
  tasks,
  loading,
  onAddTaskClick,
  onAddTask,
  allTasks = [], // Default to empty array
  goals = [], // Default to empty array
  onEditTask,
  taskDependencies = [], // Default to empty array
  onRefreshDependencies,
}: TaskListProps) {
  const { toggleTask, updateTask, isMutating, setTasks } = useTasks(tasks); // Removed deleteTask from here, will use specific archive/delete
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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

  const handleArchiveSelected = async () => {
    await archiveMultipleTasks(selectedTasks);
    toast.success(`${selectedTasks.length} tasks archived.`);
    setSelectedTasks([]);
  };

  const handleUnarchiveSelected = async () => {
    await unarchiveMultipleTasks(selectedTasks);
    toast.success(`${selectedTasks.length} tasks unarchived.`);
    setSelectedTasks([]);
  };

  const handleDeletePermanentlySelected = async () => {
    await deleteMultipleTasks(selectedTasks); // This is the original hard delete
    toast.success(`${selectedTasks.length} tasks permanently deleted.`);
    setSelectedTasks([]);
  };

  const handleToggle = async (id: string, is_completed: boolean) => {
    await toggleTask(id, is_completed);
  };

  const handleArchive = async (id: string) => {
    await archiveTask(id);
    toast.success("Task archived.");
  };

  const handleDeletePermanently = async (id: string) => {
    await deletePermanentlyTask(id);
    toast.success("Task permanently deleted.");
  };

  const handleUpdate = async (
    id: string,
    updatedTask: Partial<Database["public"]["Tables"]["tasks"]["Update"]>,
  ) => {
    await updateTask(id, updatedTask);
  };

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null); // Change type to UniqueIdentifier | null

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        const oldIndex = tasks.findIndex((task) => task.id === active.id);
        const newIndex = tasks.findIndex((task) => task.id === over?.id);

        if (oldIndex === -1 || newIndex === -1) {
          setActiveId(null);
          return;
        }

        const newOrder = arrayMove(tasks, oldIndex, newIndex);

        setTasks(newOrder);

        const updatesToSend = newOrder.map((task, index) => ({
          id: task.id,
          position: index,
        }));

        try {
          await updateTaskOrder(updatesToSend);
          toast.success("Task order updated.");
        } catch (error) {
          console.error("Failed to update task order:", error);
          toast.error("Failed to update task order.");
          setTasks(tasks); // Revert to original order on error
        }
      }
      setActiveId(null);
    },
    [tasks, setTasks],
  );

  const activeTask = activeId
    ? tasks.find((task) => task.id === activeId)
    : null;

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
        onUpdate={handleUpdate}
        onArchive={handleArchive}
        onDeletePermanently={handleDeletePermanently}
        goals={goals?.map((goal) => ({ id: goal.id, title: goal.title }))}
        allTasks={allTasks}
        taskDependencies={taskDependencies}
        onRefreshDependencies={onRefreshDependencies}
      />
      <div className="flex flex-col h-full">
        <div className="flex flex-col gap-2 p-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            {/* TaskFilterBar and TaskSort components will be handled in app/tasks/page.tsx */}
            <p>Filter and Sort controls will go here.</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto py-2">
          {selectedTasks.length > 0 && (
            <div className="sticky top-0 z-10 p-2 border-b flex items-center justify-between bg-slate-50 dark:bg-slate-800">
              <span className="text-sm font-medium">
                {selectedTasks.length} selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleArchiveSelected}
                  disabled={isMutating}
                >
                  Archive Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnarchiveSelected}
                  disabled={isMutating}
                >
                  Unarchive Selected
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeletePermanentlySelected}
                  disabled={isMutating}
                >
                  Delete Permanently
                </Button>
              </div>
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
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tasks.map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onArchive={handleArchive}
                    onDeletePermanently={handleDeletePermanently}
                    onUpdate={handleUpdate}
                    onEdit={onEditTask}
                    goal={goals?.[0] || null}
                    taskDependencies={taskDependencies || []}
                    allTasks={allTasks || []}
                    onOpenModal={handleOpenModal}
                    isSelected={selectedTasks.includes(task.id)}
                    onAddTask={onAddTask}
                    onSelect={handleSelectTask}
                    isDragging={activeId === task.id} // Pass isDragging prop
                  />
                ))}
              </SortableContext>
              {createPortal(
                <DragOverlay>
                  {activeTask ? (
                    <TaskItem
                      task={activeTask}
                      onToggle={handleToggle}
                      onArchive={handleArchive}
                      onDeletePermanently={handleDeletePermanently}
                      onUpdate={handleUpdate}
                      onEdit={onEditTask}
                      goal={goals?.[0] || null}
                      taskDependencies={taskDependencies || []}
                      allTasks={allTasks || []}
                      onOpenModal={handleOpenModal}
                      isSelected={selectedTasks.includes(activeTask.id)}
                      onAddTask={onAddTask}
                      onSelect={handleSelectTask}
                      isOverlay // Indicate this is an overlay item
                    />
                  ) : null}
                </DragOverlay>,
                document.body,
              )}
            </DndContext>
          )}
        </div>
      </div>
    </>
  );
}
