"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskInput } from "./task-input";
import { TaskList } from "./task-list";
import { useTasks } from "@/hooks/use-tasks";
import { useAuth } from "@/contexts/auth-context";

export function TodoList() {
  const { addTask, isMutating } = useTasks();
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
        <TaskList onAddTaskClick={handleAddTaskClick} />
        <TaskInput
          ref={taskInputRef}
          onAddTask={(input) => addTask({ ...input, user_id: user?.id || "" })}
          disabled={isMutating}
        />
      </CardContent>
    </Card>
  );
}
