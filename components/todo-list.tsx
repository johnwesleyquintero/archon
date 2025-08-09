"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { TaskInput } from "./task-input";
import { TaskList } from "./task-list";
import { useTasks } from "@/hooks/use-tasks";
import { useGoals } from "@/hooks/use-goals";
import { useAuth } from "@/contexts/auth-context";
import { Task as TaskType } from "@/lib/types/task"; // Import Task as TaskType to avoid conflict
import { TaskFormValues } from "@/lib/validators";

interface TodoListProps {
  initialTasks?: TaskType[]; // Use TaskType here
}

export function TodoList({ initialTasks }: TodoListProps) {
  const { tasks, loading, addTask, isMutating } = useTasks(initialTasks);
  const { goals } = useGoals();
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
        status: "todo",
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
          allTasks={tasks} // Pass all tasks for parent selection in modal
          goals={goals} // Pass goals to TaskList for TaskDetailsModal
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
