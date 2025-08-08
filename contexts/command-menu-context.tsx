"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CommandMenuContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const CommandMenuContext = createContext<CommandMenuContextType | undefined>(
  undefined,
);

export function CommandMenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <CommandMenuContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </CommandMenuContext.Provider>
  );
}

export function useCommandMenuContext() {
  const context = useContext(CommandMenuContext);
  if (context === undefined) {
    throw new Error(
      "useCommandMenuContext must be used within a CommandMenuProvider",
    );
  }
  return context;
}
