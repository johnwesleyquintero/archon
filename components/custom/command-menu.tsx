"use client";

import React, { useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useCommandMenuContext } from "@/contexts/command-menu-context";
import { useGlobalQuickAdd } from "@/lib/state/use-global-quick-add";
import { useTasks } from "@/hooks/use-tasks";
import { useRouter } from "next/navigation";
import {
  CirclePlus,
  Goal,
  Book,
  CheckCircle,
  LayoutDashboard,
  ListTodo,
  KanbanSquare,
  Settings,
} from "lucide-react"; // Import icons

export function CommandMenu() {
  const router = useRouter();
  const { isOpen, close, toggle } = useCommandMenuContext();
  const { open: openGlobalQuickAdd } = useGlobalQuickAdd();
  const { tasks, toggleTask } = useTasks(); // Assuming useTasks fetches all tasks

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  const runCommand = async (command: () => void | Promise<void>) => {
    close();
    await command();
  };

  const incompleteTasks = tasks.filter((task) => !task.is_completed);

  return (
    <CommandDialog open={isOpen} onOpenChange={close}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => void runCommand(() => openGlobalQuickAdd("task"))}
          >
            <CirclePlus className="mr-2 h-4 w-4" />
            <span>New Task</span>
          </CommandItem>
          <CommandItem
            onSelect={() => void runCommand(() => openGlobalQuickAdd("goal"))}
          >
            <Goal className="mr-2 h-4 w-4" />
            <span>New Goal</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              void runCommand(() => openGlobalQuickAdd("journal"))
            }
          >
            <Book className="mr-2 h-4 w-4" />
            <span>New Journal Entry</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Navigate">
          <CommandItem
            onSelect={() => void runCommand(() => router.push("/dashboard"))}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() => void runCommand(() => router.push("/goals"))}
          >
            <Goal className="mr-2 h-4 w-4" />
            <span>Goals</span>
          </CommandItem>
          <CommandItem
            onSelect={() => void runCommand(() => router.push("/tasks"))}
          >
            <ListTodo className="mr-2 h-4 w-4" />
            <span>Tasks</span>
          </CommandItem>
          <CommandItem
            onSelect={() => void runCommand(() => router.push("/kanban"))}
          >
            <KanbanSquare className="mr-2 h-4 w-4" />
            <span>Kanban</span>
          </CommandItem>
          <CommandItem
            onSelect={() => void runCommand(() => router.push("/journal"))}
          >
            <Book className="mr-2 h-4 w-4" />
            <span>Journal</span>
          </CommandItem>
          <CommandItem
            onSelect={() => void runCommand(() => router.push("/settings"))}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Tasks">
          {tasks.map((task) => (
            <CommandItem
              key={task.id}
              onSelect={() =>
                void runCommand(() => router.push(`/tasks#${task.id}`))
              }
            >
              {task.title}
            </CommandItem>
          ))}
        </CommandGroup>
        {incompleteTasks.length > 0 && (
          <CommandGroup heading="Mark Task Complete">
            {incompleteTasks.map((task) => (
              <CommandItem
                key={task.id}
                onSelect={() =>
                  void runCommand(() => toggleTask(task.id, true))
                }
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                <span>{task.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
