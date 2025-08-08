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
import { useTasks } from "@/hooks/use-tasks";
import { useRouter } from "next/navigation";

export function CommandMenu() {
  const router = useRouter();
  const { isOpen, close } = useCommandMenu();
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
