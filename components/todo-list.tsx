"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { TaskInput } from "./task-input";
import { TaskList } from "./task-list";
import { useTasks } from "@/hooks/use-tasks";
import { useAuth } from "@/contexts/auth-context";
import type { Database } from "@/lib/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TodoListProps {
  initialTasks?: Task[];
}

export function TodoList({ initialTasks }: TodoListProps) {
  const { addTask, isMutating } = useTasks(initialTasks);
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
          onAddTask={async (input) => {
            if (user) {
              await addTask({
                title: input.title,
                due_date: input.dueDate,
                priority: input.priority,
                category: input.category,
                tags: input.tags,
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
