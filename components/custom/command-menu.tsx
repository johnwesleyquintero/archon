"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useCommandMenu } from "@/lib/state/use-command-menu";
import { useQuickAddTask } from "@/lib/state/use-quick-add-task";
import { useQuickAddGoal } from "@/lib/state/use-quick-add-goal";
import { useQuickAddJournal } from "@/lib/state/use-quick-add-journal";
import { useTasks } from "@/hooks/use-tasks";
import { useRouter } from "next/navigation";
import { CirclePlus, Goal, Book } from "lucide-react"; // Import icons

export function CommandMenu() {
  const router = useRouter();
  const { isOpen, close } = useCommandMenu();
  const { open: openQuickAddTask } = useQuickAddTask();
  const { open: openQuickAddGoal } = useQuickAddGoal();
  const { open: openQuickAddJournal } = useQuickAddJournal();
  const { tasks } = useTasks(); // Assuming useTasks fetches all tasks

  const runCommand = (command: () => void) => {
    close();
    command();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={close}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runCommand(openQuickAddTask)}>
            <CirclePlus className="mr-2 h-4 w-4" />
            <span>New Task</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(openQuickAddGoal)}>
            <Goal className="mr-2 h-4 w-4" />
            <span>New Goal</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(openQuickAddJournal)}>
            <Book className="mr-2 h-4 w-4" />
            <span>New Journal Entry</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Tasks">
          {tasks.map((task) => (
            <CommandItem
              key={task.id}
              onSelect={() =>
                runCommand(() => router.push(`/tasks#${task.id}`))
              }
            >
              {task.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
