"use client";

import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useCommandMenuContext } from "@/contexts/command-menu-context";
import { useTasks } from "@/hooks/use-tasks";

export function useTaskCommands() {
  const router = useRouter();
  const { registerCommandGroup, unregisterCommandGroup } =
    useCommandMenuContext();
  const { tasks, toggleTask } = useTasks();

  useEffect(() => {
    const taskGroup = {
      heading: "Tasks",
      commands: tasks.map((task) => ({
        id: `task-${task.id}`,
        label: task.title,
        action: () => router.push(`/tasks#${task.id}`),
      })),
    };

    const incompleteTasks = tasks.filter((task) => !task.is_completed);
    const completeTaskGroup = {
      heading: "Mark Task Complete",
      commands: incompleteTasks.map((task) => ({
        id: `complete-task-${task.id}`,
        label: task.title,
        icon: CheckCircle,
        action: () => toggleTask(task.id, true),
      })),
    };

    if (tasks.length > 0) {
      registerCommandGroup(taskGroup);
    }
    if (incompleteTasks.length > 0) {
      registerCommandGroup(completeTaskGroup);
    }

    return () => {
      unregisterCommandGroup("Tasks");
      unregisterCommandGroup("Mark Task Complete");
    };
  }, [tasks, registerCommandGroup, unregisterCommandGroup, router, toggleTask]);
}
