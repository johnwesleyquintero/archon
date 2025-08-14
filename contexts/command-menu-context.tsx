"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { LucideIcon } from "lucide-react";

// Define the structure for a single command
export interface Command {
  id: string;
  label: string;
  icon?: LucideIcon;
  action: () => void;
}

// Define the structure for a group of commands
export interface CommandGroup {
  heading: string;
  commands: Command[];
}

// Define the context type
interface CommandMenuContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  commandGroups: CommandGroup[];
  registerCommandGroup: (group: CommandGroup) => void;
  unregisterCommandGroup: (heading: string) => void;
}

const CommandMenuContext = createContext<CommandMenuContextType | undefined>(
  undefined,
);

export function CommandMenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [commandGroups, setCommandGroups] = useState<CommandGroup[]>([]);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  const registerCommandGroup = useCallback((newGroup: CommandGroup) => {
    setCommandGroups((prevGroups) => {
      // Avoid duplicates
      if (prevGroups.some((g) => g.heading === newGroup.heading)) {
        return prevGroups;
      }
      return [...prevGroups, newGroup];
    });
  }, []);

  const unregisterCommandGroup = useCallback((heading: string) => {
    setCommandGroups((prevGroups) =>
      prevGroups.filter((g) => g.heading !== heading),
    );
  }, []);

  return (
    <CommandMenuContext.Provider
      value={{
        isOpen,
        open,
        close,
        toggle,
        commandGroups,
        registerCommandGroup,
        unregisterCommandGroup,
      }}
    >
      {children}
    </CommandMenuContext.Provider>
  );
}

export function useCommandMenuContext() {
  const context = useContext(CommandMenuContext);
  if (context === undefined) {
    throw new Error(
      "useCommandMenu-context must be used within a CommandMenuProvider",
    );
  }
  return context;
}
