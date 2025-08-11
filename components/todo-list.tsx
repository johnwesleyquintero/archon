"use client";

"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskInput } from "./task-input";
import { TaskList } from "./task-list";
import { useTasks } from "@/hooks/use-tasks";
import { useGoals } from "@/hooks/use-goals";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import { Task as TaskType } from "@/lib/types/task";
import { TaskFormValues } from "@/lib/validators";
import { TaskEditModal } from "@/components/task-edit-modal";

export interface TodoListProps {
  initialTasks?: TaskType[];
}

export function TodoList({ initialTasks }: TodoListProps) {
  const { tasks, loading, addTask, isMutating } = useTasks(initialTasks);
  const { goals } = useGoals();
  const { user } = useAuth();
  const taskInputRef = useRef<HTMLInputElement>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskType | null>(null);

  const handleAddTaskClick = () => {
    taskInputRef.current?.focus();
  };

  const handleAddTask = async (input: TaskFormValues) => {
    if (user) {
      await addTask({
        ...input,
        user_id: user.id,
      });
    }
  };

  const handleEditTask = (task: TaskType) => {
    setTaskToEdit(task);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setTaskToEdit(null);
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Todo List</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4">
          <TaskList
            tasks={tasks}
            loading={loading}
            onAddTaskClick={handleAddTaskClick}
            onAddTask={handleAddTask}
            allTasks={tasks}
            goals={goals}
            onEditTask={handleEditTask}
          />
        </CardContent>
      </Card>
      <TaskInput
        ref={taskInputRef}
        onAddTask={handleAddTask}
        disabled={isMutating || !user}
        goals={goals}
      />
      <TaskEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        task={taskToEdit}
        goals={goals}
      />
    </>
  );
}
