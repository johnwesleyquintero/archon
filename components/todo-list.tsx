"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { TaskInput } from "./task-input";
import { TaskList } from "./task-list";
import { useTasks } from "@/hooks/use-tasks";
import { useAuth } from "@/contexts/auth-context";
import { Task as TaskType } from "@/lib/types/task"; // Import Task as TaskType to avoid conflict

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
        />
        <TaskInput
          ref={taskInputRef}
          // eslint-disable-next-line @typescript-eslint/require-await
          onAddTask={async (input) => {
            if (user) {
              addTask({
                title: input.title,
                due_date: input.dueDate,
                priority: input.priority,
                category: input.category,
                tags: input.tags,
                status: input.status, // Added status
                user_id: user.id,
              });
            }
          }}
          disabled={isMutating || !user}
        />
      </CardContent>
    </Card>
  );
}
