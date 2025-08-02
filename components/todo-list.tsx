"use client";

import { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskInput } from "./task-input";
import { TaskList } from "./task-list";
import { useTasks } from "@/hooks/use-tasks";
import { useAuth } from "@/contexts/auth-context";
import type { Database } from "@/lib/supabase/types";
import { useToast } from "@/components/ui/use-toast";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TodoListProps {
  initialTasks?: Task[];
  error?: boolean;
}

export function TodoList({ initialTasks, error }: TodoListProps) {
  const { addTask, isMutating } = useTasks(initialTasks);
  const { user } = useAuth();
  const taskInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching tasks",
        description: "There was an issue loading your tasks. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

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
