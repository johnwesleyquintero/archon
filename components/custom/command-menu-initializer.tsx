"use client";

import { useCommandMenuCommands } from "@/hooks/use-command-menu-commands";
import { useTaskCommands } from "@/hooks/use-task-commands";

export function CommandMenuInitializer() {
  useCommandMenuCommands();
  useTaskCommands();
  return null;
}
