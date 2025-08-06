"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { TaskInput } from "./task-input";
import { TaskList } from "./task-list";
import { useTasks } from "@/hooks/use-tasks";
import { useAuth } from "@/contexts/auth-context";
import { Task as TaskType } from "@/lib/types/task"; // Import Task as TaskType to avoid conflict
import { TaskFormValues } from "@/lib/validators";

interface TodoListProps {
  initialTasks?: TaskType[]; // Use TaskType here
}

export function TodoList({ initialTasks }: TodoListProps) {
  const { tasks, loading, addTask, isMutating } = useTasks(initialTasks);
  const { user } = useAuth();
  const taskInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Todo List</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4">
        <TaskList
          tasks={tasks}
          loading={loading}
          onAddTaskClick={handleAddTaskClick}
          onAddTask={handleAddTask}
        />
        <TaskInput
          ref={taskInputRef}
          onAddTask={handleAddTask}
          disabled={isMutating || !user}
        />
      </CardContent>
    </Card>
  );
}
