import { create } from "zustand";

interface QuickAddTaskState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useQuickAddTask = create<QuickAddTaskState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
