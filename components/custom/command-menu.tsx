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
import { useQuickAddTask } from "@/lib/state/use-quick-add-task";
import { useQuickAddGoal } from "@/lib/state/use-quick-add-goal";
import { useQuickAddJournal } from "@/lib/state/use-quick-add-journal";
import { useTasks } from "@/hooks/use-tasks";
import { useRouter } from "next/navigation";
import { CirclePlus, Goal, Book, CheckCircle } from "lucide-react"; // Import icons

export function CommandMenu() {
  const router = useRouter();
  const { isOpen, close, toggle } = useCommandMenuContext();
  const { open: openQuickAddTask } = useQuickAddTask();
  const { open: openQuickAddGoal } = useQuickAddGoal();
  const { open: openQuickAddJournal } = useQuickAddJournal();
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
            onSelect={() => {
              void runCommand(openQuickAddTask);
            }}
          >
            <CirclePlus className="mr-2 h-4 w-4" />
            <span>New Task</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              void runCommand(openQuickAddGoal);
            }}
          >
            <Goal className="mr-2 h-4 w-4" />
            <span>New Goal</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              void runCommand(openQuickAddJournal);
            }}
          >
            <Book className="mr-2 h-4 w-4" />
            <span>New Journal Entry</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Tasks">
          {tasks.map((task) => (
            <CommandItem
              key={task.id}
              onSelect={() => {
                void runCommand(() => router.push(`/tasks#${task.id}`));
              }}
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
                onSelect={() => {
                  void runCommand(() => toggleTask(task.id, true));
                }}
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
