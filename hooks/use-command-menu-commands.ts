"use client";

import {
  CirclePlus,
  Goal,
  Book,
  LayoutDashboard,
  ListTodo,
  KanbanSquare,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useCommandMenuContext } from "@/contexts/command-menu-context";
import { useGlobalQuickAdd } from "@/lib/state/use-global-quick-add";

export function useCommandMenuCommands() {
  const router = useRouter();
  const { registerCommandGroup, unregisterCommandGroup } =
    useCommandMenuContext();
  const { open: openGlobalQuickAdd } = useGlobalQuickAdd();

  useEffect(() => {
    const actionsGroup = {
      heading: "Actions",
      commands: [
        {
          id: "new-task",
          label: "New Task",
          icon: CirclePlus,
          action: () => openGlobalQuickAdd("task"),
        },
        {
          id: "new-goal",
          label: "New Goal",
          icon: Goal,
          action: () => openGlobalQuickAdd("goal"),
        },
        {
          id: "new-journal-entry",
          label: "New Journal Entry",
          icon: Book,
          action: () => openGlobalQuickAdd("journal"),
        },
      ],
    };

    const navigateGroup = {
      heading: "Navigate",
      commands: [
        {
          id: "goto-dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          action: () => router.push("/dashboard"),
        },
        {
          id: "goto-goals",
          label: "Goals",
          icon: Goal,
          action: () => router.push("/goals"),
        },
        {
          id: "goto-tasks",
          label: "Tasks",
          icon: ListTodo,
          action: () => router.push("/tasks"),
        },
        {
          id: "goto-kanban",
          label: "Kanban",
          icon: KanbanSquare,
          action: () => router.push("/kanban"),
        },
        {
          id: "goto-journal",
          label: "Journal",
          icon: Book,
          action: () => router.push("/journal"),
        },
        {
          id: "goto-settings",
          label: "Settings",
          icon: Settings,
          action: () => router.push("/settings"),
        },
      ],
    };

    registerCommandGroup(actionsGroup);
    registerCommandGroup(navigateGroup);

    return () => {
      unregisterCommandGroup("Actions");
      unregisterCommandGroup("Navigate");
    };
  }, [
    registerCommandGroup,
    unregisterCommandGroup,
    router,
    openGlobalQuickAdd,
  ]);
}
